import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter today's events
  const todayEvents = eventos.filter(e => {
    const d = new Date(e.dataInicio);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && e.status !== 'CANCELADO';
  });

  // São José do Rio Preto Center (Fallback)
  const defaultCenter: [number, number] = [-20.8113, -49.3758];

  useEffect(() => {
    const geocodeEvents = async () => {
        const newMarkers = await Promise.all(todayEvents.map(async (event) => {
            let position: [number, number] = defaultCenter;
            
            // Try to geocode if address is present
            if (event.endereco) {
                try {
                    // Montar endereço completo para maior precisão
                    // rua + número + bairro + cidade + estado + país
                    const fullAddress = `${event.endereco} ${event.numero || ''}, ${event.bairro || ''}, ${event.cidade || 'Botucatu'}, ${event.estado || 'SP'}, Brasil`;
                    
                    // Using Nominatim (OpenStreetMap) - Free but rate limited
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
                    const data = await response.json();

                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        
                        // Validate city if possible (simple check)
                        // If result is far from expected city, log warning
                        
                        // Log structured data for diagnosis
                        console.log('Geocoding result:', {
                            action: "geocode_event_location",
                            enderecoOriginal: `${event.endereco} ${event.numero} - ${event.cidade} ${event.estado}`,
                            enderecoEnviado: fullAddress,
                            latitude: lat,
                            longitude: lon,
                            cidadeRetornada: data[0].display_name, // Nominatim returns full address in display_name
                            eventoId: event.id
                        });

                        position = [lat, lon];
                    } else {
                        console.warn(`Geocoding failed for event ${event.id}: Address not found`);
                    }
                } catch (error) {
                    console.error(`Geocoding error for event ${event.id}:`, error);
                }
            } else {
                // If no address, fallback to pseudo-random offset around center
                const hash = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const latOffset = (hash % 100 - 50) / 1000;
                const lngOffset = (hash % 100 - 50) / 1000;
                position = [defaultCenter[0] + latOffset, defaultCenter[1] + lngOffset];
            }

            return {
                id: event.id,
                position,
                title: event.titulo,
                client: event.clienteNome,
                time: new Date(event.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                address: `${event.endereco || ''}, ${event.numero || ''}`
            };
        }));
        setMarkers(newMarkers);
    };

    if (todayEvents.length > 0) {
        geocodeEvents();
    }
  }, [eventos.length]); // Re-run if events list changes size (approximation for update)

  if (!isMounted) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Mapa de Eventos (Hoje)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-[300px] relative">
        {markers.length === 0 ? (
             <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/10">
                <p className="text-sm">Sem eventos com localização para hoje.</p>
             </div>
        ) : (
            <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map(marker => (
                <Marker key={marker.id} position={marker.position}>
                <Popup>
                    <div className="text-sm">
                        <strong className="block mb-1">{marker.title}</strong>
                        <span className="block text-muted-foreground">{marker.time} - {marker.client}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{marker.address}</span>
                    </div>
                </Popup>
                </Marker>
            ))}
            </MapContainer>
        )}
      </CardContent>
    </Card>
  );
}
