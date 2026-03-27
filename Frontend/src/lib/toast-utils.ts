import { toast } from "sonner";

/**
 * Utilitário centralizado para notificações (toasts) padronizadas.
 * Fornece mensagens humanizadas e visual moderno consistente.
 */

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description: description || "Não foi possível completar a ação. Tente novamente.",
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
  });
};

// Helpers para ações comuns com mensagens humanizadas
export const feedback = {
  // Auth
  loginSuccess: () => showSuccessToast("Bem-vindo de volta!", "Login realizado com sucesso."),
  loginError: () => showErrorToast("Acesso negado", "Credenciais inválidas. Confira os dados e tente novamente."),
  logoutSuccess: () => showInfoToast("Até logo!", "Você saiu do sistema com segurança."),
  
  // CRUD Genérico
  createSuccess: (item: string) => showSuccessToast(`${item} cadastrado!`, "Os dados foram salvos corretamente."),
  updateSuccess: (item: string) => showSuccessToast(`${item} atualizado!`, "As alterações foram aplicadas com sucesso."),
  deleteSuccess: (item: string) => showSuccessToast(`${item} removido`, "O registro foi excluído permanentemente."),
  
  // Erros
  apiError: (msg?: string) => showErrorToast("Erro de conexão", msg || "O servidor não respondeu. Verifique sua internet."),
  validationError: (msg: string) => showWarningToast("Atenção aos dados", msg),
  
  // Utilidades
  copySuccess: (item: string) => showInfoToast("Copiado!", `${item} está na sua área de transferência.`),
};
