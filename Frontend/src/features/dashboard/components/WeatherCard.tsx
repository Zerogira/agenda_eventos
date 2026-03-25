import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, CloudSun, Loader2, Thermometer, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeatherData {
  temperature: number;
  weathercode: number;
  apparent_temperature?: number;
  precipitation_probability?: number;
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const lat = -20.8113;
    const lon = -49.3758;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature,precipitation_probability&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const now = new Date();
          const hour = now.getHours();
          setWeather({
            ...data.current_weather,
            apparent_temperature: data.hourly.apparent_temperature[hour],
            precipitation_probability: data.hourly.precipitation_probability[hour]
          });
        } else {
            setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="h-6 w-6 text-orange-500" />;
    if (code <= 3) return <CloudSun className="h-6 w-6 text-amber-500" />;
    if (code <= 65) return <CloudRain className="h-6 w-6 text-blue-500" />;
    return <Cloud className="h-6 w-6 text-slate-400" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Céu limpo";
    if (code === 1) return "Limpo";
    if (code === 2) return "Parcialmente";
    if (code === 3) return "Encoberto";
    if (code <= 65) return "Chuva";
    return "Nublado";
  };

  const getWeatherStyle = (code: number, temp: number) => {
    if (code >= 60) return "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200 border-t-indigo-500"; // Chuva -> Roxo/Azulado
    if (temp >= 25) return "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 border-t-orange-500"; // Quente -> Laranja/Amarelo
    if (temp < 20) return "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 border-t-blue-500"; // Frio -> Azul/Ciano
    return "bg-white border-slate-200 border-t-indigo-600";
  };

  const getIconContainerStyle = (code: number, temp: number) => {
    if (code >= 60) return "bg-indigo-500/20 text-indigo-700 border-indigo-200";
    if (temp >= 25) return "bg-orange-500/20 text-orange-700 border-orange-200";
    if (temp < 20) return "bg-blue-500/20 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <Card className="h-full border-slate-100">
        <CardContent className="flex items-center justify-center h-[110px]">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) return null;

  const styleClass = getWeatherStyle(weather.weathercode, weather.temperature);
  const iconStyle = getIconContainerStyle(weather.weathercode, weather.temperature);

  return (
    <Card className={`h-full transition-all duration-700 shadow-sm border-t-4 border-t-transparent ${styleClass}`}>
      <CardHeader className="pb-1 pt-2.5 px-3">
        <CardTitle className="text-[9px] font-black text-slate-500/70 uppercase tracking-[0.2em] flex justify-between">
            <span>Tempo Real</span>
            <span className="font-bold opacity-50">{format(new Date(), "HH:mm")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-inner border backdrop-blur-sm ${iconStyle}`}>
              {getWeatherIcon(weather.weathercode)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-start">
                <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">{Math.round(weather.temperature)}</span>
                <span className="text-xs font-bold text-slate-400 mt-0.5 ml-0.5">°C</span>
              </div>
              <span className="text-[10px] text-slate-600 font-black uppercase mt-1 tracking-tight">{getWeatherDescription(weather.weathercode)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-white/40 backdrop-blur-[2px] rounded-lg p-2 border border-white/50">
          <div className="flex items-center gap-2">
            <Thermometer className="h-3 w-3 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-800 leading-none">{Math.round(weather.apparent_temperature || 0)}°</span>
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Sensação</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-3 w-3 text-blue-500/70" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-800 leading-none">{weather.precipitation_probability}%</span>
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Chuva</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
