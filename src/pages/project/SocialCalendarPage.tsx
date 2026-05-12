/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SocialPostEditor } from "@/components/SocialPostEditor";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths, isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, ImageIcon, Sparkles, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-bg/80 text-ink-2 border border-line",
  scheduled: "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(144,37,242,0.2)]",
  published: "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30",
};

export function SocialCalendarPage() {
  const { project } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editPost, setEditPost] = useState<any | null>(null);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [retryingPostId, setRetryingPostId] = useState<string | null>(null);

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["social_posts_calendar", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("social_posts" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("scheduled_at", { ascending: true });
      return (data || []) as any[];
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = Array(startPad).fill(null).concat(days);

  const getPostsForDay = (day: Date) =>
    posts.filter((p: any) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day));

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const unscheduledPosts = posts.filter((p: any) => !p.scheduled_at && p.status === "draft");

  const handleRunSchedulerNow = async () => {
    setRunningScheduler(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-scheduled-social-posts", {
        body: { limit: 50 },
      });
      if (error) throw error;
      await refetch();
      toast.success(`Scheduler run complete: ${data?.published ?? 0} published, ${data?.failed ?? 0} failed`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to run scheduler");
    } finally {
      setRunningScheduler(false);
    }
  };

  const handleRetryPublish = async (postId: string) => {
    setRetryingPostId(postId);
    try {
      const { data, error } = await supabase.functions.invoke("process-scheduled-social-posts", {
        body: { post_ids: [postId], force: true, limit: 1 },
      });
      if (error) throw error;
      await refetch();
      toast.success(`Retry complete: ${data?.published ?? 0} published, ${data?.failed ?? 0} failed`);
    } catch (err: any) {
      toast.error(err?.message || "Retry failed");
    } finally {
      setRetryingPostId(null);
    }
  };

  if (editorOpen) {
    return (
      <SocialPostEditor
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditPost(null);
        }}
        projectId={project.id}
        idea={null}
        existingPost={editPost}
        onSaved={refetch}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-ink tracking-tight">Social <span className="grad-text">Calendar</span></h1>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
            {posts.filter((p: any) => p.status === "scheduled").length} SCHEDULED ·{" "}
            {posts.filter((p: any) => p.status === "published").length} PUBLISHED ·{" "}
            {unscheduledPosts.length} DRAFTS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
            onClick={handleRunSchedulerNow}
            disabled={runningScheduler}
          >
            {runningScheduler ? "RUNNING..." : "RUN SCHEDULER NOW"}
          </Button>
          <Button
            className="btn-grad text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => { setEditPost(null); setEditorOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> SCHEDULE POST
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pl-1">
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600"><span className="h-2 w-2 rounded-full border border-line bg-bg" /> Draft</span>
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(144,37,242,0.5)]" /> Scheduled</span>
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#22d3ee]"><span className="h-2 w-2 rounded-full bg-[#22d3ee]" /> Published</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
        {/* Calendar */}
        <div className="glass rounded-[2.5rem] overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-line">
            <h2 className="text-xl font-black text-ink tracking-tight">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2.5 rounded-xl bg-bg border border-line hover:border-primary/40 transition-all text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-bg border border-line hover:border-primary/40 transition-all text-slate-600"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2.5 rounded-xl bg-bg border border-line hover:border-primary/40 transition-all text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {paddedDays.map((day, idx) => {
              if (!day) return <div key={`pad-${idx}`} className="border-b border-r border-white/5 min-h-[100px]" />;
              const dayPosts = getPostsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentDay = isToday(day);
              const inMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    "border-b border-r border-line min-h-[120px] p-3 cursor-pointer transition-all",
                    isSelected ? "bg-primary/5 border-primary/40" : "hover:bg-primary/5",
                    !inMonth && "opacity-20"
                  )}
                >
                  <div className={cn(
                    "text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-xl mb-2 tracking-tighter transition-all",
                    isCurrentDay ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-ink opacity-40 group-hover:opacity-100"
                  )}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post: any) => (
                      <div
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); setEditPost(post); setEditorOpen(true); }}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                          STATUS_COLORS[post.status] || "bg-white/10"
                        )}
                      >
                        {post.caption?.substring(0, 25)}...
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-1">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: selected day or unscheduled drafts */}
        <div className="space-y-6">
          {/* Strategy Summary Card */}
          <div className="p-6 rounded-[2rem] bg-ink text-bg relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Health</h3>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black">{posts.filter(p => p.status === 'scheduled').length > 0 ? "OPTIMAL" : "STAGNANT"}</p>
                <p className="text-[10px] text-bg/40 font-bold uppercase tracking-widest">Current Velocity Index</p>
              </div>
              <div className="pt-4 border-t border-bg/10">
                <p className="text-[11px] font-bold leading-relaxed opacity-80 italic">
                  "Neural analysis suggests a gap in evening engagement. Try scheduling a high-value insight post for Wednesday 7PM."
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart2 className="h-20 w-20" />
            </div>
          </div>

          {selectedDay ? (
            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-600">
                {format(selectedDay, "MMMM d, yyyy")}
              </h3>
              {selectedDayPosts.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-3">No posts on this day</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-xs"
                    onClick={() => { setEditPost(null); setEditorOpen(true); }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayPosts.map((post: any) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={() => { setEditPost(post); setEditorOpen(true); }}
                      onRetryPublish={() => handleRetryPublish(post.id)}
                      retrying={retryingPostId === post.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-600">Unscheduled Drafts</h3>
              {unscheduledPosts.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-muted-foreground">No unscheduled drafts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unscheduledPosts.map((post: any) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={() => { setEditPost(post); setEditorOpen(true); }}
                      onRetryPublish={() => handleRetryPublish(post.id)}
                      retrying={retryingPostId === post.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function PostCard({
  post,
  onEdit,
  onRetryPublish,
  retrying,
}: {
  post: any;
  onEdit: () => void;
  onRetryPublish: () => void;
  retrying: boolean;
}) {
  return (
    <div
      onClick={onEdit}
      className="p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
          {post.image_url ? (
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{post.caption?.substring(0, 50)}...</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              STATUS_COLORS[post.status] || "bg-muted/50 text-muted-foreground"
            )}>
              {post.status}
            </span>
            {post.scheduled_at && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(post.scheduled_at), "h:mm a")}
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-muted-foreground">
              Attempts: {post.publish_attempts ?? 0}
              {post.last_publish_attempt_at ? ` · Last try: ${format(new Date(post.last_publish_attempt_at), "MMM d, h:mm a")}` : ""}
            </p>
            {post.publish_error && (
              <p className="text-[10px] text-red-600 line-clamp-2">Error: {post.publish_error}</p>
            )}
          </div>
          {post.status === "scheduled" && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 rounded-lg text-[9px] font-black uppercase tracking-widest"
              onClick={(e) => {
                e.stopPropagation();
                onRetryPublish();
              }}
              disabled={retrying}
            >
              {retrying ? "Retrying..." : "Retry Publish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
