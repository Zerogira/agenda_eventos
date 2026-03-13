import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeatherData {
  temperature: number;
  weathercode: number;
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Coordinates for São José do Rio Preto (Example from prompt)
    const lat = -20.8113;
    const lon = -49.3758;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          setWeather(data.current_weather);
        } else {
            setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="h-8 w-8 text-yellow-500" />;
    if (code <= 3) return <CloudSun className="h-8 w-8 text-yellow-400" />;
    if (code <= 60) return <CloudRain className="h-8 w-8 text-blue-400" />;
    return <Cloud className="h-8 w-8 text-gray-400" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Céu limpo";
    if (code === 1) return "Principalmente limpo";
    if (code === 2) return "Parcialmente nublado";
    if (code === 3) return "Encoberto";
    if (code <= 48) return "Neblina";
    if (code <= 55) return "Chuvisco";
    if (code <= 65) return "Chuva";
    if (code <= 75) return "Neve";
    if (code <= 82) return "Pancadas de chuva";
    if (code <= 99) return "Tempestade";
    return "Desconhecido";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Clima Hoje</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[100px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Clima Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Indisponível</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
            <span>Clima Hoje</span>
            <span className="text-xs font-normal">{format(new Date(), "dd 'de' MMM", { locale: ptBR })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-slate-800">{weather.temperature}°C</span>
            <span className="text-sm text-muted-foreground">{getWeatherDescription(weather.weathercode)}</span>
          </div>
          <div className="p-2 bg-white rounded-full shadow-sm">
            {getWeatherIcon(weather.weathercode)}
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
            📍 São José do Rio Preto
        </div>
      </CardContent>
    </Card>
  );
}
