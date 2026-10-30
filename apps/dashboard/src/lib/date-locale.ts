import { setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";

// Datas do date-fns (format, formatDistance...) em PT-BR; importado no layout (servidor) e no provider tRPC (cliente).
setDefaultOptions({ locale: ptBR });
