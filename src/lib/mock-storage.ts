import { Brinquedo } from "@/features/brinquedos/types";
import { Funcionario } from "@/features/funcionarios/types";
import { Cliente } from "@/features/clientes/types";
import { Evento } from "@/features/eventos/types";

// Helper para simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockStorage {
  private isEnabled: boolean;

  constructor() {
    // Mock storage só funciona se VITE_USE_MOCK_STORAGE for 'true'
    this.isEnabled = import.meta.env.VITE_USE_MOCK_STORAGE === 'true';
  }

  private checkEnabled() {
    if (!this.isEnabled) {
      // Retorna uma promise rejeitada ou vazia dependendo da estratégia.
      // Aqui vamos lançar um erro para sinalizar que o mock está desligado
      // e que a aplicação deve tentar usar a API real ou falhar.
      throw new Error("Mock Storage is disabled. Please set VITE_USE_MOCK_STORAGE=true in .env to enable it, or implement real API calls.");
    }
  }

  private get<T>(key: string): T[] {
    this.checkEnabled();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]) {
    this.checkEnabled();
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Brinquedos
  async getBrinquedos(): Promise<Brinquedo[]> {
    this.checkEnabled();
    await delay(500);
    return this.get<Brinquedo>("brinquedos");
  }

  async createBrinquedo(brinquedo: Omit<Brinquedo, "id">): Promise<Brinquedo> {
    await delay(500);
    const brinquedos = this.get<Brinquedo>("brinquedos");
    const newBrinquedo = { ...brinquedo, id: Date.now() } as Brinquedo;
    this.set("brinquedos", [...brinquedos, newBrinquedo]);
    return newBrinquedo;
  }

  async updateBrinquedo(id: number, brinquedo: Partial<Brinquedo>): Promise<Brinquedo> {
    await delay(500);
    const brinquedos = this.get<Brinquedo>("brinquedos");
    const index = brinquedos.findIndex((b) => b.id === id);
    if (index !== -1) {
      const updatedBrinquedo = { ...brinquedos[index], ...brinquedo };
      brinquedos[index] = updatedBrinquedo;
      this.set("brinquedos", brinquedos);
      return updatedBrinquedo;
    }
    throw new Error("Brinquedo não encontrado");
  }

  async deleteBrinquedo(id: number): Promise<void> {
    await delay(500);
    const brinquedos = this.get<Brinquedo>("brinquedos");
    const newBrinquedos = brinquedos.filter((b) => b.id !== id);
    this.set("brinquedos", newBrinquedos);
  }

  // Funcionarios
  async getFuncionarios(): Promise<Funcionario[]> {
    await delay(500);
    return this.get<Funcionario>("funcionarios");
  }

  async createFuncionario(funcionario: Omit<Funcionario, "id">): Promise<Funcionario> {
    await delay(500);
    const funcionarios = this.get<Funcionario>("funcionarios");
    const newFuncionario = { ...funcionario, id: Date.now() } as Funcionario;
    this.set("funcionarios", [...funcionarios, newFuncionario]);
    return newFuncionario;
  }

  async updateFuncionario(id: number, funcionario: Partial<Funcionario>): Promise<Funcionario> {
    await delay(500);
    const funcionarios = this.get<Funcionario>("funcionarios");
    const index = funcionarios.findIndex((f) => f.id === id);
    if (index !== -1) {
      const updatedFuncionario = { ...funcionarios[index], ...funcionario };
      funcionarios[index] = updatedFuncionario;
      this.set("funcionarios", funcionarios);
      return updatedFuncionario;
    }
    throw new Error("Funcionário não encontrado");
  }

  async deleteFuncionario(id: number): Promise<void> {
    await delay(500);
    const funcionarios = this.get<Funcionario>("funcionarios");
    const newFuncionarios = funcionarios.filter((f) => f.id !== id);
    this.set("funcionarios", newFuncionarios);
  }

  // Clientes
  async getClientes(): Promise<Cliente[]> {
    await delay(500);
    return this.get<Cliente>("clientes");
  }

  async createCliente(cliente: Omit<Cliente, "id">): Promise<Cliente> {
    await delay(500);
    const clientes = this.get<Cliente>("clientes");
    const newCliente = { ...cliente, id: Date.now() } as Cliente;
    this.set("clientes", [...clientes, newCliente]);
    return newCliente;
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    await delay(500);
    const clientes = this.get<Cliente>("clientes");
    const index = clientes.findIndex((c) => c.id === id);
    if (index !== -1) {
      const updatedCliente = { ...clientes[index], ...cliente };
      clientes[index] = updatedCliente;
      this.set("clientes", clientes);
      return updatedCliente;
    }
    throw new Error("Cliente não encontrado");
  }

  async deleteCliente(id: number): Promise<void> {
    await delay(500);
    const clientes = this.get<Cliente>("clientes");
    const newClientes = clientes.filter((c) => c.id !== id);
    this.set("clientes", newClientes);
  }

  // Eventos
  async getEventos(): Promise<Evento[]> {
    await delay(500);
    const eventos = this.get<Evento>("eventos");
    if (eventos.length === 0) {
      // Seed some data if empty
      const today = new Date();
      const mockEventos: Evento[] = [
        {
          id: "1",
          titulo: "Aniversário do João",
          dataInicio: new Date(new Date().setDate(today.getDate() - 5)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() - 5)).toISOString(),
          clienteId: "c1",
          clienteNome: "Maria Silva",
          status: "concluido",
          valor: 500,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "2",
          titulo: "Festa da Empresa X",
          dataInicio: today.toISOString(),
          dataFim: today.toISOString(),
          clienteId: "c2",
          clienteNome: "Empresa X",
          status: "agendado",
          valor: 1200,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "3",
          titulo: "Casamento Ana e Pedro",
          dataInicio: new Date(new Date().setDate(today.getDate() + 10)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() + 10)).toISOString(),
          clienteId: "c3",
          clienteNome: "Ana Souza",
          status: "agendado",
          valor: 3000,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "4",
          titulo: "Festa Infantil - Miguel",
          dataInicio: new Date(new Date().setDate(today.getDate() - 20)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() - 20)).toISOString(),
          clienteId: "c4",
          clienteNome: "Carlos Oliveira",
          status: "concluido",
          valor: 800,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "5",
          titulo: "Evento Corporativo Tech",
          dataInicio: new Date(new Date().setDate(today.getDate() - 45)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() - 45)).toISOString(),
          clienteId: "c2",
          clienteNome: "Empresa X",
          status: "concluido",
          valor: 2500,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "6",
          titulo: "Chá de Bebê Sofia",
          dataInicio: new Date(new Date().setDate(today.getDate() + 5)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() + 5)).toISOString(),
          clienteId: "c5",
          clienteNome: "Juliana Lima",
          status: "agendado",
          valor: 600,
          brinquedos: [],
          funcionarios: []
        },
        {
          id: "7",
          titulo: "Aniversário 15 anos",
          dataInicio: new Date(new Date().setDate(today.getDate() + 25)).toISOString(),
          dataFim: new Date(new Date().setDate(today.getDate() + 25)).toISOString(),
          clienteId: "c6",
          clienteNome: "Roberto Santos",
          status: "agendado",
          valor: 4500,
          brinquedos: [],
          funcionarios: []
        },
        {
           id: "8",
           titulo: "Festa Cancelada",
           dataInicio: new Date(new Date().setDate(today.getDate() - 10)).toISOString(),
           dataFim: new Date(new Date().setDate(today.getDate() - 10)).toISOString(),
           clienteId: "c7",
           clienteNome: "Paulo Teste",
           status: "cancelado",
           valor: 0,
           brinquedos: [],
           funcionarios: []
        }
      ];
      this.set("eventos", mockEventos);
      return mockEventos;
    }
    return eventos;
  }

  async createEvento(evento: Omit<Evento, "id">): Promise<Evento> {
    await delay(500);
    const eventos = this.get<Evento>("eventos");
    const newEvento = { ...evento, id: Date.now().toString() } as Evento;
    this.set("eventos", [...eventos, newEvento]);
    return newEvento;
  }
  async updateEvento(id: string, evento: Partial<Evento>): Promise<Evento> {
    await delay(500);
    const eventos = this.get<Evento>("eventos");
    const index = eventos.findIndex((e) => e.id === id);
    if (index !== -1) {
      const updatedEvento = { ...eventos[index], ...evento };
      eventos[index] = updatedEvento;
      this.set("eventos", eventos);
      return updatedEvento;
    }
    throw new Error("Evento não encontrado");
  }

  async deleteEvento(id: string): Promise<void> {
    await delay(500);
    const eventos = this.get<Evento>("eventos");
    const newEventos = eventos.filter((e) => e.id !== id);
    this.set("eventos", newEventos);
  }
}

export const mockStorage = new MockStorage();
