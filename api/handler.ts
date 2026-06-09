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
    model: 'claude-sonnet-4-5',
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

// ── Usage limits ──────────────────────────────────────────────────────

const FREE_DAILY = 3
const FREE_MONTHLY = 20
const PRO_MONTHLY = 80
const PREMIUM_MONTHLY = 300
const AI_PATHS = new Set(['/resumen', '/ejercicios', '/clase', '/examen', '/comentario', '/esquema', '/flashcards', '/corrector', '/timeline'])

async function checkAndIncrementUsage(userId: string): Promise<void> {
  const db = getFirestore()
  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()
  const data = userDoc.data() ?? {}
  const isPremium = data.isPremium === true
  const isPro = data.isPro === true || isPremium
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)
  const usage = data.usage ?? {}
  const dailyCount = usage.dailyDate === today ? (usage.dailyCount ?? 0) : 0
  const monthlyCount = usage.monthlyMonth === thisMonth ? (usage.monthlyCount ?? 0) : 0

  if (isPremium) {
    if (monthlyCount >= PREMIUM_MONTHLY) {
      const err: any = new Error(`Límite mensual Premium alcanzado (${PREMIUM_MONTHLY}/mes). Escríbenos si necesitas más.`)
      err.isLimit = true; throw err
    }
  } else if (isPro) {
    if (monthlyCount >= PRO_MONTHLY) {
      const err: any = new Error(`Límite mensual Pro alcanzado (${PRO_MONTHLY}/mes). Actualiza a Premium para uso ilimitado.`)
      err.isLimit = true; throw err
    }
  } else {
    if (dailyCount >= FREE_DAILY) {
      const err: any = new Error(`Límite diario alcanzado (${FREE_DAILY}/día en plan gratuito). Actualiza a Pro para continuar.`)
      err.isLimit = true; throw err
    }
    if (monthlyCount >= FREE_MONTHLY) {
      const err: any = new Error(`Límite mensual alcanzado (${FREE_MONTHLY}/mes en plan gratuito). Actualiza a Pro para continuar.`)
      err.isLimit = true; throw err
    }
  }

  await userRef.set({
    usage: {
      dailyCount: dailyCount + 1,
      dailyDate: today,
      monthlyCount: monthlyCount + 1,
      monthlyMonth: thisMonth,
    }
  }, { merge: true })
}

// ── Guardar en historial ──────────────────────────────────────────────

async function saveHistorial(userId: string, tipo: string, contenidoOriginal: string, resultado: string) {
  try {
    const db = getFirestore()
    await db.collection('historial').doc(userId).collection('items').add({
      tipo,
      contenidoOriginal: contenidoOriginal?.slice(0, 300) ?? '',
      resultado,
      fecha: new Date(),
    })
  } catch (e) {
    // No bloqueamos la respuesta si falla el historial
    console.error('Error guardando historial:', e)
  }
}

// ── Handler principal ─────────────────────────────────────────────────

function sendJson(res: any, status: number, data: any) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export default async function handler(req: any, res: any) {
  try {
  setCors(res)

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  const path = getPath(req)

  // Health check
  if (req.method === 'GET' && path === '/health') {
    return sendJson(res, 200, { ok: true, path, method: req.method })
  }

  // Stripe webhook (sin auth)
  if (req.method === 'POST' && path === '/stripe/webhook') {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const sig = req.headers['stripe-signature'] as string
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
      const db = getFirestore()
      const PRICE_PREMIUM = process.env.STRIPE_PRICE_ID_PREMIUM ?? ''

      const updateSubscription = async (customerId: string, active: boolean, priceId?: string) => {
        const snap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get()
        if (!snap.empty) {
          const isPremium = active && priceId === PRICE_PREMIUM
          await snap.docs[0].ref.set({ isPro: active, isPremium: active ? isPremium : false }, { merge: true })
        }
      }

      const obj = event.data.object as any
      const customerId = obj.customer
      const priceId = obj.lines?.data?.[0]?.price?.id ?? obj.plan?.id ?? ''

      if (['checkout.session.completed', 'invoice.paid'].includes(event.type)) {
        await updateSubscription(customerId, true, priceId)
      } else if (['customer.subscription.deleted', 'invoice.payment_failed'].includes(event.type)) {
        await updateSubscription(customerId, false)
      }
      return sendJson(res, 200, { received: true })
    } catch (e: any) {
      return sendJson(res, 400, { error: e.message })
    }
  }

  // ── Rutas autenticadas ────────────────────────────────────────────

  let userId: string, userEmail: string
  try {
    const decoded = await verifyAuth(req)
    userId = decoded.uid
    userEmail = decoded.email
  } catch (authErr: any) {
    return sendJson(res, 401, { error: 'No autorizado', detail: authErr.message })
  }

  const body = req.body ?? {}

  try {
    // USAGE CHECK para rutas de IA
    if (AI_PATHS.has(path) && req.method === 'POST') {
      try {
        await checkAndIncrementUsage(userId)
      } catch (e: any) {
        if (e.isLimit) return sendJson(res, 429, { error: e.message, isLimit: true })
        throw e
      }
    }

    // GET /usage
    if (req.method === 'GET' && path === '/usage') {
      const db = getFirestore()
      const userDoc = await db.collection('users').doc(userId).get()
      const data = userDoc.data() ?? {}
      const isPro = data.isPro === true
      const today = new Date().toISOString().slice(0, 10)
      const thisMonth = today.slice(0, 7)
      const usage = data.usage ?? {}
      const isPremium2 = data.isPremium === true
      const isPro2 = data.isPro === true || isPremium2
      return sendJson(res, 200, {
        isPro: isPro2,
        isPremium: isPremium2,
        dailyCount: usage.dailyDate === today ? (usage.dailyCount ?? 0) : 0,
        dailyLimit: isPro2 ? null : FREE_DAILY,
        monthlyCount: usage.monthlyMonth === thisMonth ? (usage.monthlyCount ?? 0) : 0,
        monthlyLimit: isPremium2 ? PREMIUM_MONTHLY : isPro2 ? PRO_MONTHLY : FREE_MONTHLY,
      })
    }

    // RESUMEN
    if (req.method === 'POST' && path === '/resumen') {
      const { texto, fileBase64, fileType, longitud, curso } = body
      const lon: any = { corto: '200-300 palabras', medio: '400-600 palabras', extenso: '700-1000 palabras' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea un resumen de ${lon[longitud] || lon.medio} en español${curso ? ` para ${curso}` : ''}. Usa estructura clara.`,
        buildContent(texto, fileBase64, fileType)
      )
      await saveHistorial(userId, 'resumen', texto ?? '', text)
      return sendJson(res, 200, { resumen: text, longitud, tokensUsados })
    }

    // EJERCICIOS
    if (req.method === 'POST' && path === '/ejercicios') {
      const { texto, fileBase64, fileType, nivel, curso } = body
      const niv: any = { basico: 'básico y conciso', detallado: 'detallado paso a paso', completo: 'completo con todas las explicaciones' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Resuelve los ejercicios de forma ${niv[nivel] || niv.detallado} en español${curso ? ` para ${curso}` : ''}. Muestra todos los pasos.`,
        buildContent(texto, fileBase64, fileType)
      )
      await saveHistorial(userId, 'ejercicios', texto ?? '', text)
      return sendJson(res, 200, { solucion: text, ejerciciosEncontrados: (texto?.match(/\d+[.)]/g) || []).length || 1, tokensUsados })
    }

    // CLASE
    if (req.method === 'POST' && path === '/clase') {
      const { tema, fileBase64, fileType, nivel, curso } = body
      const niv: any = { sencillo: 'de forma muy sencilla con ejemplos cotidianos', intermedio: 'de forma clara con ejemplos', extenso: 'de forma completa y profunda' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor brillante. Explica ${niv[nivel] || niv.intermedio} en español${curso ? ` para ${curso}` : ''}. Estructura: introducción, desarrollo con ejemplos, conclusión.`,
        buildContent(tema, fileBase64, fileType)
      )
      await saveHistorial(userId, 'clase', tema ?? '', text)
      return sendJson(res, 200, { explicacion: text, tokensUsados })
    }

    // EXAMEN
    if (req.method === 'POST' && path === '/examen') {
      const { tema, fileBase64, fileType, numPreguntas, tipo, curso } = body
      const tip: any = {
        test: `tipo test. Formato EXACTO para cada pregunta:\n1. Texto de la pregunta\nA) Opción incorrecta\nB) Opción incorrecta\nC) Opción correcta *\nD) Opción incorrecta`,
        desarrollo: `de desarrollo. Formato EXACTO:\n1. Texto de la pregunta\nRespuesta: respuesta completa aquí`,
        mixto: `mixtas (mitad test, mitad desarrollo). Usa el mismo formato que los tipos anteriores según corresponda`,
      }
      const { text, tokensUsados } = await ask(
        `Eres un profesor. Crea exactamente ${numPreguntas} preguntas de examen ${tip[tipo] || tip.mixto} sobre el tema en español${curso ? ` para ${curso}` : ''}. IMPORTANTE: NO incluyas campos de Nombre, Fecha ni encabezados. Empieza directamente con "1." y numera todas las preguntas. En las tipo test, marca la correcta con * al final de la opción.`,
        buildContent(tema, fileBase64, fileType)
      )
      await saveHistorial(userId, 'examen', tema ?? '', text)
      return sendJson(res, 200, { preguntas: text, numPreguntas, tipo, tokensUsados })
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
      await saveHistorial(userId, 'comentario', texto ?? '', text)
      return sendJson(res, 200, { comentario: text, tipo, tokensUsados })
    }

    // ESQUEMA
    if (req.method === 'POST' && path === '/esquema') {
      const { texto, fileBase64, fileType, tipo, curso } = body
      const tip: any = { esquema: 'esquema jerárquico con epígrafes y subepígrafes', mapa: 'mapa conceptual en formato texto con relaciones', tabla: 'tabla resumen organizada por columnas' }
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea un ${tip[tipo] || tip.esquema} del contenido en español${curso ? ` para ${curso}` : ''}. Sé claro y organizado.`,
        buildContent(texto, fileBase64, fileType)
      )
      await saveHistorial(userId, 'esquema', texto ?? '', text)
      return sendJson(res, 200, { esquema: text, tokensUsados })
    }

    // FLASHCARDS
    if (req.method === 'POST' && path === '/flashcards') {
      const { texto, fileBase64, fileType, num, curso } = body
      const { text, tokensUsados } = await ask(
        `Eres un profesor experto. Crea exactamente ${num} flashcards en español${curso ? ` para ${curso}` : ''}.\nFormato de cada una:\n**Pregunta:** [pregunta]\n**Respuesta:** [respuesta]\n---`,
        buildContent(texto, fileBase64, fileType)
      )
      await saveHistorial(userId, 'flashcards', texto ?? '', text)
      return sendJson(res, 200, { flashcards: text, tokensUsados })
    }

    // CORRECTOR
    if (req.method === 'POST' && path === '/corrector') {
      const { texto, modo, curso } = body
      const instruccion: Record<string, string> = {
        corregir: 'Corrige ÚNICAMENTE los errores ortográficos, gramaticales y de puntuación.',
        mejorar:  'Mejora ÚNICAMENTE el estilo, vocabulario y fluidez sin cambiar el significado.',
        ambos:    'Corrige los errores ortográficos y gramaticales, y además mejora el estilo y vocabulario.',
      }
      const { text, tokensUsados } = await ask(
        `Eres un profesor de lengua experto en español${curso ? ` (nivel ${curso})` : ''}.
${instruccion[modo] || instruccion.ambos}

FORMATO DE RESPUESTA — MUY IMPORTANTE:
- Devuelve SOLO el texto corregido/mejorado, sin títulos, sin secciones, sin explicaciones.
- Cada palabra o frase que hayas cambiado, márcala con este formato exacto: [original→corrección]
- Ejemplo: Soy [juan→Juan] [carlos→Carlos] y [tengo→tenía] 17 años.
- Si no cambias una palabra, escríbela normal sin marcadores.
- No añadas NINGÚN texto extra antes ni después del texto corregido.`,
        texto
      )
      await saveHistorial(userId, 'corrector', texto ?? '', text)
      return sendJson(res, 200, { resultado: text, tokensUsados })
    }

    // TIMELINE
    if (req.method === 'POST' && path === '/timeline') {
      const { tema, fileBase64, fileType, detalle, curso } = body
      const rangoEventos: Record<string, string> = {
        resumido: 'entre 3 y 5 eventos (solo los más importantes y decisivos)',
        mixto:    'entre 6 y 10 eventos (los más relevantes con buen nivel de detalle)',
        extenso:  '12 o más eventos (cobertura exhaustiva, incluyendo causas, consecuencias y eventos secundarios)',
      }
      const rango = rangoEventos[detalle ?? 'mixto']
      const { text, tokensUsados } = await ask(
        `Eres un profesor de historia experto. Genera una línea del tiempo en español${curso ? ` para nivel ${curso}` : ''}.

Genera ${rango}. Sé coherente con el contenido: si el texto o tema abarca poco período, genera menos eventos pero más precisos. Si abarca mucho, cúbrelo bien.

FORMATO OBLIGATORIO — sigue este esquema exactamente:
## [Título del tema]
[Rango de años, ej: 1789 – 1799]

### [AÑO] - [Título del evento]
[Descripción del evento en 1-2 frases claras y directas]

### [AÑO] - [Título del evento]
[Descripción]

Ordena los eventos cronológicamente. Cada evento debe tener año concreto, título claro y descripción útil para estudiar.`,
        buildContent(`Crea una línea del tiempo sobre: ${tema || 'el contenido adjunto'}`, fileBase64, fileType)
      )
      await saveHistorial(userId, 'timeline', tema ?? '', text)
      return sendJson(res, 200, { timeline: text, tokensUsados })
    }

    // HISTORIAL GET
    if (req.method === 'GET' && path === '/historial') {
      const snap = await getFirestore()
        .collection('historial').doc(userId).collection('items')
        .orderBy('fecha', 'desc').limit(50).get()
      return sendJson(res, 200, snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    // HISTORIAL DELETE
    if (req.method === 'DELETE' && path.startsWith('/historial/')) {
      const itemId = path.split('/historial/')[1]
      await getFirestore().collection('historial').doc(userId).collection('items').doc(itemId).delete()
      return sendJson(res, 200, { ok: true })
    }

    // STRIPE CHECKOUT
    if (req.method === 'POST' && path === '/stripe/checkout') {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const plan = body.plan ?? 'pro'
      const PRICE_ID = plan === 'premium'
        ? (process.env.STRIPE_PRICE_ID_PREMIUM ?? '')
        : (process.env.STRIPE_PRICE_ID ?? '')
      if (!PRICE_ID) return sendJson(res, 500, { error: 'Stripe no configurado' })
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
      return sendJson(res, 200, { url: session.url })
    }

    // STRIPE PORTAL
    if (req.method === 'POST' && path === '/stripe/portal') {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
      const userDoc = await getFirestore().collection('users').doc(userId).get()
      const customerId = userDoc.data()?.stripeCustomerId
      if (!customerId) return sendJson(res, 400, { error: 'Sin suscripción activa' })
      const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: body.returnUrl })
      return sendJson(res, 200, { url: session.url })
    }

    return sendJson(res, 404, { error: 'Ruta no encontrada', path })

  } catch (e: any) {
    return sendJson(res, 500, { error: e.message })
  }

  } catch (fatal: any) {
    console.error('FATAL ERROR:', fatal.message, fatal.stack)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ fatal: fatal.message }))
  }
}
