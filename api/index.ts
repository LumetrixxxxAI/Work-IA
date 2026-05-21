import express from 'express'
import cors from 'cors'
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

const app = express()
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ADMIN_EMAIL = 'jcocana2009@gmail.com'

// Stripe webhook necesita raw body — va ANTES de express.json
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
    res.json({ received: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }))
app.use(express.json({ limit: '25mb' }))

// Middleware de autenticación
async function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.slice(7)
  if (!token) { res.status(401).json({ error: 'No autorizado' }); return }
  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.userId = decoded.uid
    req.userEmail = decoded.email
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

// Helper: construir contenido para Claude (texto + imagen/PDF)
function content(text: string, b64?: string, type?: string) {
  if (!b64 || !type) return text || 'Procesa el contenido.'
  const block: any = type === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } }
    : { type: 'image', source: { type: 'base64', media_type: type, data: b64 } }
  return text ? [block, { type: 'text', text }] : [block]
}

// Helper: llamar a Claude
async function ask(system: string, userContent: any) {
  const r = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8096,
    system,
    messages: [{ role: 'user', content: userContent }],
  })
  const text = r.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
  return { text, tokensUsados: r.usage.input_tokens + r.usage.output_tokens }
}

// ── RUTAS ─────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.post('/api/resumen', auth, async (req, res) => {
  try {
    const { texto, fileBase64, fileType, longitud, curso } = req.body
    const lon: any = { corto: '200-300 palabras', medio: '400-600 palabras', extenso: '700-1000 palabras' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor experto. Crea un resumen de ${lon[longitud] || lon.medio} en español${curso ? ` para ${curso}` : ''}. Usa estructura clara.`,
      content(texto, fileBase64, fileType)
    )
    res.json({ resumen: text, longitud, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/ejercicios', auth, async (req, res) => {
  try {
    const { texto, fileBase64, fileType, nivel, curso } = req.body
    const niv: any = { basico: 'básico y conciso', detallado: 'detallado paso a paso', completo: 'completo con todas las explicaciones' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor experto. Resuelve los ejercicios de forma ${niv[nivel] || niv.detallado} en español${curso ? ` para ${curso}` : ''}. Muestra todos los pasos.`,
      content(texto, fileBase64, fileType)
    )
    res.json({ solucion: text, ejerciciosEncontrados: (texto?.match(/\d+[.)]/g) || []).length || 1, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/clase', auth, async (req, res) => {
  try {
    const { tema, fileBase64, fileType, nivel, curso } = req.body
    const niv: any = { sencillo: 'de forma muy sencilla con ejemplos cotidianos', intermedio: 'de forma clara con ejemplos', extenso: 'de forma completa y profunda' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor brillante. Explica ${niv[nivel] || niv.intermedio} en español${curso ? ` para ${curso}` : ''}. Estructura: introducción, desarrollo con ejemplos, conclusión.`,
      content(tema, fileBase64, fileType)
    )
    res.json({ explicacion: text, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/examen', auth, async (req, res) => {
  try {
    const { tema, numPreguntas, tipo, curso } = req.body
    const tip: any = { test: 'tipo test con 4 opciones (señala la correcta con *)', desarrollo: 'de desarrollo', mixto: 'mixtas: mitad test, mitad desarrollo' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor. Crea ${numPreguntas} preguntas de examen ${tip[tipo] || tip.mixto} sobre el tema en español${curso ? ` para ${curso}` : ''}. Incluye respuestas al final.`,
      tema
    )
    res.json({ preguntas: text, numPreguntas, tipo, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/comentario', auth, async (req, res) => {
  try {
    const { texto, fileBase64, fileType, tipo, nivel, curso } = req.body
    const tip: any = {
      literario: 'literario (localización, tema, estructura, recursos estilísticos, valoración)',
      filosofico: 'filosófico (contextualización, tesis, argumentos, valoración crítica)',
      historico: 'histórico (contexto, análisis, causas, consecuencias, valoración)'
    }
    const niv: any = { basico: 'básico y estructurado', completo: 'completo y académico' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor experto. Realiza un comentario ${niv[nivel] || niv.completo} de texto ${tip[tipo] || tip.literario} en español${curso ? ` para ${curso}` : ''}.`,
      content(texto, fileBase64, fileType)
    )
    res.json({ comentario: text, tipo, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/esquema', auth, async (req, res) => {
  try {
    const { texto, fileBase64, fileType, tipo, curso } = req.body
    const tip: any = { esquema: 'esquema jerárquico con epígrafes y subepígrafes', mapa: 'mapa conceptual en formato texto con relaciones', tabla: 'tabla resumen organizada por columnas' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor experto. Crea un ${tip[tipo] || tip.esquema} del contenido en español${curso ? ` para ${curso}` : ''}. Sé claro y organizado.`,
      content(texto, fileBase64, fileType)
    )
    res.json({ esquema: text, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/flashcards', auth, async (req, res) => {
  try {
    const { texto, fileBase64, fileType, num, curso } = req.body
    const { text, tokensUsados } = await ask(
      `Eres un profesor experto. Crea exactamente ${num} flashcards en español${curso ? ` para ${curso}` : ''}.\nFormato de cada una:\n**Pregunta:** [pregunta]\n**Respuesta:** [respuesta]\n---`,
      content(texto, fileBase64, fileType)
    )
    res.json({ flashcards: text, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/corrector', auth, async (req, res) => {
  try {
    const { texto, modo, curso } = req.body
    const mod: any = { corregir: 'corrige los errores ortográficos y gramaticales marcando cada corrección', mejorar: 'mejora el estilo y vocabulario manteniendo el significado', ambos: 'primero corrige errores y luego mejora el estilo' }
    const { text, tokensUsados } = await ask(
      `Eres un profesor de lengua experto. ${mod[modo] || mod.ambos} en español${curso ? ` (nivel ${curso})` : ''}. Explica las correcciones principales.`,
      texto
    )
    res.json({ resultado: text, erroresEncontrados: (text.match(/error|corrección/gi) || []).length, tokensUsados })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/historial', auth, async (req: any, res) => {
  try {
    const snap = await getFirestore().collection('historial').doc(req.userId).collection('items')
      .orderBy('fecha', 'desc').limit(50).get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/historial/:itemId', auth, async (req: any, res) => {
  try {
    await getFirestore().collection('historial').doc(req.userId).collection('items').doc(req.params.itemId).delete()
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/stripe/checkout', auth, async (req: any, res) => {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
    const PRICE_ID = process.env.STRIPE_PRICE_ID ?? ''
    if (!PRICE_ID) { res.status(500).json({ error: 'Stripe no configurado' }); return }
    const db = getFirestore()
    const userDoc = await db.collection('users').doc(req.userId).get()
    let customerId = userDoc.data()?.stripeCustomerId
    if (!customerId) {
      const c = await stripe.customers.create({ email: req.userEmail, metadata: { firebaseUid: req.userId } })
      customerId = c.id
      await db.collection('users').doc(req.userId).set({ stripeCustomerId: customerId }, { merge: true })
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl,
      locale: 'es',
    })
    res.json({ url: session.url })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/stripe/portal', auth, async (req: any, res) => {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
    const userDoc = await getFirestore().collection('users').doc(req.userId).get()
    const customerId = userDoc.data()?.stripeCustomerId
    if (!customerId) { res.status(400).json({ error: 'Sin suscripción activa' }); return }
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: req.body.returnUrl })
    res.json({ url: session.url })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

export default app
