import Anthropic from '@anthropic-ai/sdk'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Helpers ───────────────────────────────────────────────────────────

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function getPath(req: any): string {
  const url: string = req.url || ''
  const path = url.split('?')[0]
  return path.replace(/^\/api/, '') || '/'
}

async function verifyAuth(req: any): Promise<{ uid: string; email: string }> {
  const token = req.headers.authorization?.slice(7)
  if (!token) throw new Error('No autorizado')
  const decoded = await getAuth().verifyIdToken(token)
  return { uid: decoded.uid, email: decoded.email ?? '' }
}

function buildContent(text: string, b64?: string, type?: string) {
  if (!b64 || !type) return text || 'Procesa el contenido.'
  const block: any = type === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } }
    : { type: 'image', source: { type: 'base64', media_type: type, data: b64 } }
  return text ? [block, { type: 'text', text }] : [block]
}

async function ask(system: string, userContent: any) {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8096,
    system,
    messages: [{ role: 'user', content: userContent }],
  })
  const text = r.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
  return { text, tokensUsados: r.usage.input_tokens + r.usage.output_tokens }
}

// ── Handler principal ─────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  setCors(res)

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const path = getPath(req)

  // Health check
  if (req.method === 'GET' && path === '/health') {
    return res.json({ ok: true })
  }

  // Stripe webhook (sin auth)
  if (req.method === 'POST' && path === '/stripe/webhook') {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const sig = req.headers['stripe-signature'] as string
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
      const db = getFirestore()
      const updatePro = async (customerId: string, isPro: boolean) => {
        const snap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get()
        if (!snap.empty) await snap.docs[0].ref.set({ isPro }, { merge: true })
      }
      const customerId = (event.data.object as { customer: string }).customer
      if (['checkout.session.completed', 'invoice.paid'].includes(event.type)) {
        await updatePro(customerId, true)
      } else if (['customer.subscription.deleted', 'invoice.payment_failed'].includes(event.type)) {
        await updatePro(customerId, false)
      }
      return res.json({ received: true })
    } catch (e: any) {
      return res.status(400).json({ error: e.message })
    }
  }

  // ── Rutas autenticadas ────────────────────────────────────────────

  let userId: string, userEmail: string
  try {
    const decoded = await verifyAuth(req)
    userId = decoded.uid
    userEmail = decoded.email
  } catch {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const body = req.body ?? {}

  try {
    // RESUMEN
    if (req.method === 'POST' && path === '/resumen') {
      const { texto, fileBase64, fileType, longitud, curso } = body
      const lon: any = { corto: '200-300 palabras', medio: '400-600 palabras', extenso: '700-1000 palabras' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea un resumen de ${lon[longitud] || lon.medio} en español${curso ? ` para ${curso}` : ''}. Usa estructura clara.`,
        buildContent(texto, fileBase64, fileType)
      )
      return res.json({ resumen: text, longitud, tokensUsados })
    }

    // EJERCICIOS
    if (req.method === 'POST' && path === '/ejercicios') {
      const { texto, fileBase64, fileType, nivel, curso } = body
      const niv: any = { basico: 'básico y conciso', detallado: 'detallado paso a paso', completo: 'completo con todas las explicaciones' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Resuelve los ejercicios de forma ${niv[nivel] || niv.detallado} en español${curso ? ` para ${curso}` : ''}. Muestra todos los pasos.`,
        buildContent(texto, fileBase64, fileType)
      )
      return res.json({ solucion: text, ejerciciosEncontrados: (texto?.match(/\d+[.)]/g) || []).length || 1, tokensUsados })
    }

    // CLASE
    if (req.method === 'POST' && path === '/clase') {
      const { tema, fileBase64, fileType, nivel, curso } = body
      const niv: any = { sencillo: 'de forma muy sencilla con ejemplos cotidianos', intermedio: 'de forma clara con ejemplos', extenso: 'de forma completa y profunda' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor brillante. Explica ${niv[nivel] || niv.intermedio} en español${curso ? ` para ${curso}` : ''}. Estructura: introducción, desarrollo con ejemplos, conclusión.`,
        buildContent(tema, fileBase64, fileType)
      )
      return res.json({ explicacion: text, tokensUsados })
    }

    // EXAMEN
    if (req.method === 'POST' && path === '/examen') {
      const { tema, numPreguntas, tipo, curso } = body
      const tip: any = { test: 'tipo test con 4 opciones (señala la correcta con *)', desarrollo: 'de desarrollo', mixto: 'mixtas: mitad test, mitad desarrollo' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor. Crea ${numPreguntas} preguntas de examen ${tip[tipo] || tip.mixto} sobre el tema en español${curso ? ` para ${curso}` : ''}. Incluye respuestas al final.`,
        tema
      )
      return res.json({ preguntas: text, numPreguntas, tipo, tokensUsados })
    }

    // COMENTARIO
    if (req.method === 'POST' && path === '/comentario') {
      const { texto, fileBase64, fileType, tipo, nivel, curso } = body
      const tip: any = {
        literario: 'literario (localización, tema, estructura, recursos estilísticos, valoración)',
        filosofico: 'filosófico (contextualización, tesis, argumentos, valoración crítica)',
        historico: 'histórico (contexto, análisis, causas, consecuencias, valoración)'
      }
      const niv: any = { basico: 'básico y estructurado', completo: 'completo y académico' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Realiza un comentario ${niv[nivel] || niv.completo} de texto ${tip[tipo] || tip.literario} en español${curso ? ` para ${curso}` : ''}.`,
        buildContent(texto, fileBase64, fileType)
      )
      return res.json({ comentario: text, tipo, tokensUsados })
    }

    // ESQUEMA
    if (req.method === 'POST' && path === '/esquema') {
      const { texto, fileBase64, fileType, tipo, curso } = body
      const tip: any = { esquema: 'esquema jerárquico con epígrafes y subepígrafes', mapa: 'mapa conceptual en formato texto con relaciones', tabla: 'tabla resumen organizada por columnas' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea un ${tip[tipo] || tip.esquema} del contenido en español${curso ? ` para ${curso}` : ''}. Sé claro y organizado.`,
        buildContent(texto, fileBase64, fileType)
      )
      return res.json({ esquema: text, tokensUsados })
    }

    // FLASHCARDS
    if (req.method === 'POST' && path === '/flashcards') {
      const { texto, fileBase64, fileType, num, curso } = body
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea exactamente ${num} flashcards en español${curso ? ` para ${curso}` : ''}.\nFormato de cada una:\n**Pregunta:** [pregunta]\n**Respuesta:** [respuesta]\n---`,
        buildContent(texto, fileBase64, fileType)
      )
      return res.json({ flashcards: text, tokensUsados })
    }

    // CORRECTOR
    if (req.method === 'POST' && path === '/corrector') {
      const { texto, modo, curso } = body
      const mod: any = { corregir: 'corrige los errores ortográficos y gramaticales marcando cada corrección', mejorar: 'mejora el estilo y vocabulario manteniendo el significado', ambos: 'primero corrige errores y luego mejora el estilo' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor de lengua experto. ${mod[modo] || mod.ambos} en español${curso ? ` (nivel ${curso})` : ''}. Explica las correcciones principales.`,
        texto
      )
      return res.json({ resultado: text, erroresEncontrados: (text.match(/error|corrección/gi) || []).length, tokensUsados })
    }

    // HISTORIAL GET
    if (req.method === 'GET' && path === '/historial') {
      const snap = await getFirestore()
        .collection('historial').doc(userId).collection('items')
        .orderBy('fecha', 'desc').limit(50).get()
      return res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    // HISTORIAL DELETE
    if (req.method === 'DELETE' && path.startsWith('/historial/')) {
      const itemId = path.split('/historial/')[1]
      await getFirestore().collection('historial').doc(userId).collection('items').doc(itemId).delete()
      return res.json({ ok: true })
    }

    // STRIPE CHECKOUT
    if (req.method === 'POST' && path === '/stripe/checkout') {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const PRICE_ID = process.env.STRIPE_PRICE_ID ?? ''
      if (!PRICE_ID) return res.status(500).json({ error: 'Stripe no configurado' })
      const db = getFirestore()
      const userDoc = await db.collection('users').doc(userId).get()
      let customerId = userDoc.data()?.stripeCustomerId
      if (!customerId) {
        const c = await stripe.customers.create({ email: userEmail, metadata: { firebaseUid: userId } })
        customerId = c.id
        await db.collection('users').doc(userId).set({ stripeCustomerId: customerId }, { merge: true })
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        mode: 'subscription',
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        locale: 'es',
      })
      return res.json({ url: session.url })
    }

    // STRIPE PORTAL
    if (req.method === 'POST' && path === '/stripe/portal') {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const userDoc = await getFirestore().collection('users').doc(userId).get()
      const customerId = userDoc.data()?.stripeCustomerId
      if (!customerId) return res.status(400).json({ error: 'Sin suscripción activa' })
      const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: body.returnUrl })
      return res.json({ url: session.url })
    }

    return res.status(404).json({ error: 'Ruta no encontrada', path })

  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
