import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useActiveProject } from "@/hooks/useActiveProject";

interface ContentItem {
    id: string;
    main_keyword: string;
    created_at: string;
    scheduled_date: string | null;
    status: string;
    generated_title: string | null;
}

const CalendarPage = () => {
    const { user } = useAuth();
    const { activeProjectId } = useActiveProject();
    const projectId = activeProjectId;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            if (!user) return;
            const effectiveProjectId = projectId || activeProjectId;
            if (!effectiveProjectId) return;
            setLoading(true);

            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);

            // Actually fetch items within this month (based on created_at or scheduled_date)
            // For now, fetch all items for simple calendar mapping, 
            // but in production we'd filter > start and < end
            const { data, error } = await supabase
                .from('content_items')
                .select('id, main_keyword, created_at, scheduled_date, status, generated_title')
                .eq('user_id', user.id)
                .eq('project_id', effectiveProjectId);

            if (!error && data) {
                setItems(data as unknown as ContentItem[]);
            }
            setLoading(false);
        };

        fetchItems();
    }, [user, currentDate, projectId, activeProjectId]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getItemsForDay = (day: Date) => {
        return items.filter(item => {
            const itemDate = item.scheduled_date ? parseISO(item.scheduled_date) : parseISO(item.created_at);
            return isSameDay(itemDate, day);
        });
    };

    const updateItemDate = async (id: string, newDate: Date | undefined) => {
        if (!newDate) return;
        const effectiveProjectId = projectId || activeProjectId;
        if (!effectiveProjectId) return;
        setUpdatingId(id);
        const dateStr = newDate.toISOString();

        // Optimistic UI update
        setItems(prevItems => prevItems.map(i => i.id === id ? { ...i, scheduled_date: dateStr } : i));

        const { error } = await supabase
            .from('content_items')
            .update({ scheduled_date: dateStr } as any)
            .eq('id', id)
            .eq('project_id', effectiveProjectId);
        if (error) {
            toast.error("Failed to reschedule post.");
        } else {
            toast.success("Post rescheduled successfully!");
        }
        setUpdatingId(null);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
                    <p className="text-muted-foreground mt-1">Plan and organize your content strategy.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg p-1 bg-background drop-shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 min-w-[140px] text-center font-medium">
                            {format(currentDate, "MMMM yyyy")}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button asChild>
                        <Link to="/app/en/content/generate" className="gap-2">
                            <Plus className="h-4 w-4" /> Schedule Post
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[140px]">
                    {days.map((day, idx) => {
                        const dayItems = getItemsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={day.toString()}
                                className={`border-r border-b p-2 flex flex-col gap-1 transition-colors ${isCurrentMonth ? "bg-card" : "bg-muted/10 text-muted-foreground"
                                    } ${idx % 7 === 6 ? "border-r-0" : ""}`}
                            >
                                <div className="flex items-center justify-between px-1">
                                    <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center' : ''}`}>
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-1.5 mt-1 pr-1 scrollbar-thin">
                                    {dayItems.map(item => (
                                        <Popover key={item.id}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    className={`text-left w-full block p-1.5 text-xs rounded border hover:border-primary/50 transition-colors ${item.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                                                        item.status === 'generating' ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400' :
                                                            'bg-secondary border-border text-secondary-foreground'
                                                        }${updatingId === item.id ? ' opacity-50' : ''}`}
                                                >
                                                    <div className="font-medium truncate">{item.generated_title || item.main_keyword}</div>
                                                    <div className="text-[10px] opacity-70 capitalize truncate mt-0.5">{item.status}</div>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-4" align="start">
                                                <div className="space-y-4">
                                                    <div className="space-y-1 block">
                                                        <h4 className="font-medium leading-tight">{item.generated_title || item.main_keyword}</h4>
                                                        <p className="text-sm text-muted-foreground">Status: <span className="capitalize font-medium text-foreground">{item.status}</span></p>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t">
                                                        <Label>Schedule Date</Label>
                                                        <div className="flex justify-center border rounded-md p-1 bg-card">
                                                            <Calendar
                                                                mode="single"
                                                                selected={item.scheduled_date ? parseISO(item.scheduled_date) : parseISO(item.created_at)}
                                                                onSelect={(date) => updateItemDate(item.id, date)}
                                                                disabled={item.status === 'published'}
                                                            />
                                                        </div>
                                                        {item.status === 'published' && <p className="text-[10px] text-muted-foreground text-center">Cannot reschedule published posts</p>}
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <Button asChild size="sm" className="w-full">
                                                            <Link to={`/app/en/content/${item.id}`}>Manage Content <ArrowRight className="h-4 w-4 ml-2" /></Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
