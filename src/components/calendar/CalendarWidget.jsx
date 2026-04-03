import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Truck, Wrench, Fuel, Circle, Shield, FileText,
  Plus, X, Edit2, Trash2, AlertTriangle, CheckCircle, CalendarDays
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { getMonthDays, getEventsForDay, eventTypes } from '@/lib/calendarUtils';
import { toast } from 'sonner';

// Klucz do przechowywania wydarzeń w localStorage
const STORAGE_KEY = 'calendar_events';

const CalendarWidget = ({
  trips = [],
  services = [],
  refuelings = [],
  vehicles = [],
  onEventClick = null,
  onAddEvent = null,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Stan dla wydarzeń niestandardowych (przeglądy, polisy itp)
  const [customEvents, setCustomEvents] = useState([]);
  
  // Formularz nowego wydarzenia
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'inspection',
    date: '',
    time: '',
    vehicleId: '',
    description: '',
    reminder: false,
    reminderDays: 7,
  });

  // Typy wydarzeń do wyboru
  const eventTypeOptions = [
    { id: 'inspection', name: 'Przegląd techniczny', icon: Shield, color: 'bg-red-500' },
    { id: 'insurance', name: 'Polisa OC/AC', icon: FileText, color: 'bg-blue-500' },
    { id: 'service', name: 'Serwis', icon: Wrench, color: 'bg-yellow-500' },
    { id: 'tire_change', name: 'Wymiana opon', icon: Circle, color: 'bg-green-500' },
    { id: 'tax', name: 'Podatek', icon: FileText, color: 'bg-purple-500' },
    { id: 'meeting', name: 'Spotkanie', icon: CalendarDays, color: 'bg-cyan-500' },
    { id: 'other', name: 'Inne', icon: Clock, color: 'bg-slate-500' },
  ];

  // Wczytaj zapisane wydarzenia
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        setCustomEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }
  }, []);

  // Zapisz wydarzenia do localStorage
  const saveCustomEvents = (events) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    setCustomEvents(events);
  };

  // Połącz wszystkie wydarzenia
  const events = useMemo(() => {
    // Wydarzenia z systemu (trasy, serwisy, tankowania)
    const tripEvents = trips.map(trip => ({
      id: `trip-${trip.id}`,
      type: 'trip',
      title: `${trip.startLocation || 'Trasa'} → ${trip.endLocation || '?'}`,
      date: trip.startDate,
      endDate: trip.endDate,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      details: trip,
      isCustom: false,
    }));

    const serviceEvents = services.map(service => ({
      id: `service-${service.id}`,
      type: 'service',
      title: service.name || 'Serwis',
      date: service.date,
      vehicleId: service.vehicleId,
      details: service,
      isCustom: false,
    }));

    const refuelingEvents = refuelings.map(refueling => ({
      id: `refueling-${refueling.id}`,
      type: 'refueling',
      title: `Tankowanie - ${refueling.liters}L`,
      date: refueling.date,
      vehicleId: refueling.vehicleId,
      details: refueling,
      isCustom: false,
    }));

    // Wydarzenia niestandardowe (przeglądy, polisy itp)
    const custom = customEvents.map(event => ({
      ...event,
      isCustom: true,
    }));

    return [...tripEvents, ...serviceEvents, ...refuelingEvents, ...custom];
  }, [trips, services, refuelings, customEvents]);

  // Dni miesiąca
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);

  // Wydarzenia dla wybranego dnia
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [events, selectedDate]);

  // Nawigacja po miesiącach
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Kliknięcie na dzień
  const handleDayClick = (day) => {
    setSelectedDate(day);
    setShowEventDetails(true);
    setShowAddEventForm(false);
  };

  // Dodaj nowe wydarzenie
  const handleAddEvent = () => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setEventForm({
      ...eventForm,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
    });
    setEditingEvent(null);
    setShowAddEventForm(true);
    setShowEventDetails(false);
  };

  // Zapisz wydarzenie
  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) {
      toast.error('Podaj tytuł wydarzenia');
      return;
    }

    const newEvent = {
      id: editingEvent?.id || Date.now().toString(),
      type: eventForm.type,
      title: eventForm.title,
      date: eventForm.date,
      time: eventForm.time,
      vehicleId: eventForm.vehicleId || null,
      description: eventForm.description,
      reminder: eventForm.reminder,
      reminderDays: eventForm.reminderDays,
      createdAt: new Date().toISOString(),
    };

    if (editingEvent) {
      // Aktualizacja istniejącego wydarzenia
      const updatedEvents = customEvents.map(e => e.id === editingEvent.id ? newEvent : e);
      saveCustomEvents(updatedEvents);
      toast.success('Wydarzenie zaktualizowane');
    } else {
      // Dodanie nowego wydarzenia
      saveCustomEvents([...customEvents, newEvent]);
      toast.success('Wydarzenie dodane');
    }

    setShowAddEventForm(false);
    setEventForm({
      title: '',
      type: 'inspection',
      date: '',
      time: '',
      vehicleId: '',
      description: '',
      reminder: false,
      reminderDays: 7,
    });
  };

  // Edytuj wydarzenie
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      type: event.type,
      date: event.date.split('T')[0] || format(new Date(event.date), 'yyyy-MM-dd'),
      time: event.time || format(new Date(event.date), 'HH:mm'),
      vehicleId: event.vehicleId || '',
      description: event.description || '',
      reminder: event.reminder || false,
      reminderDays: event.reminderDays || 7,
    });
    setShowAddEventForm(true);
    setShowEventDetails(false);
  };

  // Usuń wydarzenie
  const handleDeleteEvent = (eventId) => {
    if (confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      const updatedEvents = customEvents.filter(e => e.id !== eventId);
      saveCustomEvents(updatedEvents);
      toast.success('Wydarzenie usunięte');
      setShowEventDetails(false);
    }
  };

  // Kliknięcie na wydarzenie
  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Ikona wydarzenia
  const getEventIcon = (type, size = 12) => {
    const option = eventTypeOptions.find(opt => opt.id === type);
    const Icon = option?.icon || Clock;
    return <Icon className={`w-${size} h-${size}`} />;
  };

  // Nazwa typu wydarzenia
  const getEventTypeName = (type) => {
    const option = eventTypeOptions.find(opt => opt.id === type);
    return option?.name || type;
  };

  // Kolor wydarzenia
  const getEventColor = (type) => {
    const option = eventTypeOptions.find(opt => opt.id === type);
    return option?.color || 'bg-slate-500';
  };

  // Formatowanie daty
  const formatEventDate = (date, time) => {
    if (time) {
      return format(parseISO(date), 'dd MMM yyyy', { locale: pl }) + `, ${time}`;
    }
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: pl });
  };

  const today = new Date();

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-theme-white font-semibold">Kalendarz</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-theme-white text-sm font-medium">
            {format(currentDate, 'LLLL yyyy', { locale: pl })}
          </span>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dni tygodnia */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(day => (
          <div key={day} className="text-center text-xs text-theme-white-muted py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Dni miesiąca */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayEvents = getEventsForDay(day, events);

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(day)}
              className={`
                relative p-2 rounded-lg text-center transition-all
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isToday ? 'bg-primary/20 border border-primary' : ''}
                ${isSelected ? 'bg-primary/30' : 'hover:bg-slate-700/50'}
              `}
            >
              <span className={`
                text-sm font-medium
                ${isToday ? 'text-primary' : 'text-theme-white'}
              `}>
                {format(day, 'd')}
              </span>
              
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type)}`}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Przycisk dzisiaj i dodaj wydarzenie */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="flex-1 text-xs"
        >
          Dzisiaj
        </Button>
        <Button
          size="sm"
          onClick={handleAddEvent}
          className="flex-1 bg-gradient-primary text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Dodaj wydarzenie
        </Button>
      </div>

      {/* Formularz dodawania/edycji wydarzenia */}
      <AnimatePresence>
        {showAddEventForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 pt-4 border-t border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-theme-white text-sm font-medium">
                {editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setShowAddEventForm(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-theme-white-secondary text-xs">Typ wydarzenia</Label>
                <Select value={eventForm.type} onValueChange={(v) => setEventForm({...eventForm, type: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <div className="flex items-center gap-2">
                          {getEventIcon(opt.id, 4)}
                          <span>{opt.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-theme-white-secondary text-xs">Tytuł *</Label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="Np. Przegląd techniczny"
                  className="bg-slate-800 border-slate-700 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-theme-white-secondary text-xs">Data</Label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="bg-slate-800 border-slate-700 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-theme-white-secondary text-xs">Godzina</Label>
                  <Input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    className="bg-slate-800 border-slate-700 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-theme-white-secondary text-xs">Pojazd (opcjonalnie)</Label>
                <Select value={eventForm.vehicleId} onValueChange={(v) => setEventForm({...eventForm, vehicleId: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue placeholder="Wybierz pojazd" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Brak</SelectItem>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.name} ({v.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-theme-white-secondary text-xs">Opis</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Dodatkowe informacje..."
                  className="bg-slate-800 border-slate-700 mt-1"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-theme-white-secondary text-xs">Przypomnienie</Label>
                <Switch
                  checked={eventForm.reminder}
                  onCheckedChange={(v) => setEventForm({...eventForm, reminder: v})}
                />
              </div>

              {eventForm.reminder && (
                <div>
                  <Label className="text-theme-white-secondary text-xs">Przypomnij dni przed</Label>
                  <Select value={String(eventForm.reminderDays)} onValueChange={(v) => setEventForm({...eventForm, reminderDays: parseInt(v)})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dzień przed</SelectItem>
                      <SelectItem value="3">3 dni przed</SelectItem>
                      <SelectItem value="7">7 dni przed</SelectItem>
                      <SelectItem value="14">14 dni przed</SelectItem>
                      <SelectItem value="30">30 dni przed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEvent} className="flex-1 bg-gradient-primary">
                  {editingEvent ? 'Zapisz zmiany' : 'Dodaj wydarzenie'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddEventForm(false)} className="flex-1">
                  Anuluj
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wydarzenia dnia */}
      <AnimatePresence>
        {showEventDetails && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 pt-4 border-t border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-theme-white text-sm font-medium">
                {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
              </h4>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={handleAddEvent}
                  title="Dodaj wydarzenie"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => setShowEventDetails(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-theme-white-muted">Brak wydarzeń</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddEvent}
                  className="mt-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Dodaj wydarzenie
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedEvents.map(event => (
                  <motion.div
                    key={event.id}
                    whileHover={{ x: 4 }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      event.isCustom ? 'bg-slate-800/30' : 'bg-slate-800/50'
                    } hover:bg-slate-700/50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1" onClick={() => handleEventClick(event)}>
                        <div className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-theme-white text-sm">{event.title}</span>
                            <Badge className={`${getEventColor(event.type)}/20 text-xs`}>
                              {getEventTypeName(event.type)}
                            </Badge>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-theme-white-muted">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                          )}
                          {event.description && (
                            <p className="text-xs text-theme-white-muted mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {event.isCustom && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => handleEditEvent(event)}
                            title="Edytuj"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteEvent(event.id)}
                            title="Usuń"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default CalendarWidget;