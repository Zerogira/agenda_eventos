import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Evento } from '@/features/eventos/types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a365d',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 5,
    color: '#1a365d',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 3,
  },
  monthSection: {
    marginTop: 15,
    marginBottom: 5,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    backgroundColor: '#edf2f7',
    padding: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4299e1',
  },
  eventCard: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 5,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  eventStatus: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 80,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#718096',
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: '#2d3748',
  },
  detailsSection: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  detailsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    fontSize: 8,
    color: '#4a5568',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#a0aec0',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ebf8ff',
    borderWidth: 1,
    borderColor: '#bee3f8',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#2b6cb0',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c5282',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2b6cb0',
    textAlign: 'right',
    marginTop: 5,
  }
});

interface RelatorioEventosProps {
  eventos: Evento[];
  periodo?: string;
  empresaNome?: string;
}

export const RelatorioEventos = ({ eventos, periodo, empresaNome }: RelatorioEventosProps) => {
  // Group events by month
  const groupedEvents = eventos.reduce((acc, evento) => {
    const monthKey = format(new Date(evento.dataInicio), 'MMMM yyyy', { locale: ptBR });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(evento);
    return acc;
  }, {} as Record<string, Evento[]>);

  // Calculate totals
  const totalValor = eventos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalEventos = eventos.length;

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Eventos</Text>
          {empresaNome && <Text style={styles.subtitle}>{empresaNome}</Text>}
          {periodo && <Text style={styles.subtitle}>Período: {periodo}</Text>}
          <Text style={styles.subtitle}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {Object.entries(groupedEvents).map(([month, monthEventos]) => (
          <View key={month} wrap={false}>
            <View style={styles.monthSection}>
              <Text style={styles.monthTitle}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
            </View>

            {monthEventos.map((evento) => (
              <View key={evento.id} style={styles.eventCard} wrap={false}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{evento.titulo}</Text>
                  <Text style={styles.eventStatus}>{evento.status}</Text>
                </View>
                
                <View style={styles.row}>
                  <Text style={styles.label}>Cliente:</Text>
                  <Text style={styles.value}>{evento.clienteNome || '-'}</Text>
                </View>
                
                <View style={styles.row}>
                  <Text style={styles.label}>Data:</Text>
                  <Text style={styles.value}>
                    {format(new Date(evento.dataInicio), "dd/MM/yyyy HH:mm", { locale: ptBR })} até {format(new Date(evento.dataFim), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Valor:</Text>
                  <Text style={styles.value}>{formatMoney(evento.valor || 0)}</Text>
                </View>

                {/* Brinquedos Section */}
                {evento.brinquedos && evento.brinquedos.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Brinquedos:</Text>
                    <View style={styles.detailsRow}>
                      {evento.brinquedos.map((brinquedo: any, idx) => (
                        <Text key={idx} style={styles.detailItem}>
                          {brinquedo.quantidade}x {brinquedo.nome}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Funcionarios Section */}
                {evento.funcionarios && evento.funcionarios.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Equipe:</Text>
                    <View style={styles.detailsRow}>
                      {evento.funcionarios.map((func: any, idx) => (
                        <Text key={idx} style={styles.detailItem}>
                          {func.nome}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.summary} wrap={false}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Eventos:</Text>
            <Text style={styles.summaryValue}>{totalEventos}</Text>
          </View>
          <Text style={styles.totalValue}>
            Valor Total: {formatMoney(totalValor)}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};
