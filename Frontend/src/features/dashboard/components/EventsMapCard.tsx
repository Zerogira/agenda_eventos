import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export function EventsMapCard() {
  const { data: eventos = [] } = useEventos();
  const [isMounted, setIsMounted] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const debugGeocoding = false;
  const loggedMissingAddressRef = useRef<Set<string>>(new Set());
  const eventDetailCacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    console.log("[EventsMapCard] Componente montado");
    setIsMounted(true);
  }, []);

  const todayEvents = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return eventos.filter(e => {
      if (!e.dataInicio) return false;
      const date = new Date(e.dataInicio);
      const eventDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const isToday = eventDateStr === todayStr;
      const isNotCancelled = e.status !== 'CANCELADO';
      return isToday && isNotCancelled;
    });
  }, [eventos]);

  // Botucatu Center (Novo Padrão)
  const defaultCenter: [number, number] = [-22.8850, -48.4410];

  useEffect(() => {
    if (!isMounted) return;

    if (debugGeocoding) {
      console.log("[EventsMapCard] Iniciando geocodificação para", todayEvents.length, "eventos de hoje");
      console.log("[EventsMapCard][Debug] Snapshot eventos de hoje:", todayEvents.map((e: any) => ({
        id: e.id,
        titulo: e.titulo,
        dataInicio: e.dataInicio,
        endereco: e.endereco,
        numero: e.numero,
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado,
        tipoEndereco: typeof e.endereco,
        enderecoEhNull: e.endereco === null,
        enderecoEhUndefined: typeof e.endereco === "undefined",
        enderecoTrim: typeof e.endereco === "string" ? e.endereco.trim() : null,
        enderecoTrimLen: typeof e.endereco === "string" ? e.endereco.trim().length : null
      })));
    }

    const geocodeEvents = async () => {
        const newMarkers = await Promise.all(todayEvents.map(async (event) => {
            let position: [number, number] = defaultCenter;
            let endereco = event.endereco;
            let numero = event.numero;
            let bairro = event.bairro;
            let cidade = event.cidade;
            let estado = event.estado;

            const missingAddress = !endereco || String(endereco).trim().length === 0;
            if (missingAddress) {
              try {
                let detail = eventDetailCacheRef.current.get(event.id);
                if (!detail) {
                  const { data } = await api.get<any>(`/eventos/${event.id}`);
                  detail = data?.success ? data.data : data;
                  eventDetailCacheRef.current.set(event.id, detail);
                }
                endereco = detail?.endereco;
                numero = detail?.numero;
                bairro = detail?.bairro;
                cidade = detail?.cidade;
                estado = detail?.estado;
              } catch (error) {
                console.error(`[Geocoding][FallbackDetail] Erro ao buscar detalhe do evento ${event.id}:`, error);
              }
            }

            if (debugGeocoding) {
              console.log("[Geocoding][Debug] Evento bruto antes do IF:", {
                id: event.id,
                titulo: event.titulo,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                tipoEndereco: typeof endereco,
                enderecoEhNull: endereco === null,
                enderecoEhUndefined: typeof endereco === "undefined",
                enderecoTrim: typeof endereco === "string" ? endereco.trim() : null,
                enderecoTrimLen: typeof endereco === "string" ? endereco.trim().length : null
              });
            }
            
            // Try to geocode if address is present
            if (endereco && String(endereco).trim().length > 0) {
                try {
                    // Limpar e formatar campos
                    const streetName = String(endereco).trim();
                    const streetWithPrefix = /^(rua|av|avenida|travessa|alameda)/i.test(streetName) 
                        ? streetName 
                        : `Rua ${streetName}`;
                    
                    const street = `${streetWithPrefix}${numero ? ', ' + numero : ''}`;
                    const city = cidade || 'Botucatu';
                    const state = estado || 'SP';
                    
                    console.log(`[Geocoding] Tentando: ${street}, ${city}-${state}`);

                    // 1ª Tentativa: Busca estruturada (Mais precisa)
                    const query = `format=json&street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=Brasil&addressdetails=1`;
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`);
                    const data = await response.json();

                    if (data && data.length > 0) {
                        position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        console.log(`[Geocoding] ✅ Sucesso estruturado: ${event.titulo}`, position);
                    } else {
                        // 2ª Tentativa: Busca por string única (Mais flexível)
                        const fullQuery = `${street}, ${bairro || ''}, ${city}, ${state}, Brasil`;
                        console.log(`[Geocoding] 🔄 Tentativa 2: ${fullQuery}`);
                        const response2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`);
                        const data2 = await response2.json();

                        if (data2 && data2.length > 0) {
                            position = [parseFloat(data2[0].lat), parseFloat(data2[0].lon)];
                            console.log(`[Geocoding] ✅ Sucesso fallback: ${event.titulo}`, position);
                        } else {
                            // 3ª Tentativa: Apenas Rua e Cidade (Menos precisa, mas melhor que centro)
                            const simpleQuery = `${streetWithPrefix}, ${city}, Brasil`;
                            console.log(`[Geocoding] 🔄 Tentativa 3: ${simpleQuery}`);
                            const response3 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simpleQuery)}`);
                            const data3 = await response3.json();

                            if (data3 && data3.length > 0) {
                                position = [parseFloat(data3[0].lat), parseFloat(data3[0].lon)];
                                console.warn(`[Geocoding] ⚠️ Sucesso parcial: ${event.titulo}`, position);
                            } else {
                                console.error(`[Geocoding] ❌ Falha total para: ${event.titulo}. Mantendo centro de Botucatu.`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`[Geocoding] 💥 Erro na API para ${event.titulo}:`, error);
                }
            } else {
                if (!loggedMissingAddressRef.current.has(event.id)) {
                  loggedMissingAddressRef.current.add(event.id);
                  console.warn(`[Geocoding][MissingAddress] Evento ${event.titulo} sem endereço.`, {
                    id: event.id,
                    endereco,
                    numero,
                    bairro,
                    cidade,
                    estado,
                    tipoEndereco: typeof endereco,
                    enderecoEhNull: endereco === null,
                    enderecoEhUndefined: typeof endereco === "undefined",
                    enderecoTrim: typeof endereco === "string" ? endereco.trim() : null,
                    enderecoTrimLen: typeof endereco === "string" ? endereco.trim().length : null
                  });
                }
            }

            return {
                id: event.id,
                position,
                title: event.titulo,
                client: event.clienteNome,
                time: new Date(event.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                address: `${endereco || ''}, ${numero || ''}`
            };
        }));
        setMarkers(newMarkers);
    };

    if (todayEvents.length > 0) {
        geocodeEvents();
    } else {
        if (debugGeocoding) {
          console.log("[EventsMapCard] Nenhum evento para geocodificar hoje.");
        }
        setMarkers((prev) => (prev.length === 0 ? prev : []));
    }
  }, [todayEvents, isMounted, debugGeocoding]);

  useEffect(() => {
    if (isMounted && mapRef.current) {
      // Invalidate size multiple times to handle layout shifts
      const timer1 = setTimeout(() => mapRef.current?.invalidateSize(), 100);
      const timer2 = setTimeout(() => mapRef.current?.invalidateSize(), 500);
      const timer3 = setTimeout(() => mapRef.current?.invalidateSize(), 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isMounted, markers]);

  if (!isMounted) return null;

  return (
    <Card className="h-full border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white border-t-4 border-t-indigo-600" style={{ height: '450px' }}>
      <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-50 shrink-0 bg-slate-50/30">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="h-3 w-3 text-slate-400" />
          Mapa de Operações (Hoje)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative min-h-0">
        {markers.length === 0 && todayEvents.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 z-[10]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Carregando Mapa...</span>
            </div>
          </div>
        ) : markers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50/10">
            <p className="text-xs font-medium uppercase tracking-tighter">Sem eventos com localização hoje</p>
          </div>
        ) : (
          <div className="h-full w-full">
            <MapContainer 
              center={defaultCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              ref={mapRef}
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker 
                key={marker.id} 
                position={marker.position}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm text-slate-900">{marker.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{marker.client}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">{marker.time}</span>
                      <Link 
                         to={`/eventos?id=${marker.id}`} 
                         className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider"
                       >
                         Ver Evento →
                       </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
