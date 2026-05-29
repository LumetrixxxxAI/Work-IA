import { useUserStore } from '../store/userStore'

const CURSO_LABELS: Record<string, string> = {
  eso1: '1º ESO',
  eso2: '2º ESO',
  eso3: '3º ESO',
  eso4: '4º ESO',
  bach1: '1º Bachillerato',
  bach2: '2º Bachillerato',
  fp_basica: 'FP Básica',
  fp_medio: 'FP Grado Medio',
  fp_superior: 'FP Grado Superior',
}

export function useUser() {
  const { user, isLoading, hasAccess, updateProfile } = useUserStore()

  const cursoLabel = () => {
    if (!user?.curso) return 'Sin especificar'
    return CURSO_LABELS[user.curso] ?? user.curso
  }

  return { user, isLoading, hasAccess, updateProfile, cursoLabel }
}
