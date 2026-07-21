"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema, type AnnouncementFormValues } from "@/utils/validators";
console.log("CURRENT SCHEMA:", announcementSchema);
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Announcement } from "@/types/announcement";
import { Loader2 } from "lucide-react";

interface AnnouncementFormProps {
  isOpen: boolean;
  announcement?: Announcement | null;
  onSubmit: (data: AnnouncementFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AnnouncementForm({
  isOpen,
  announcement,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  console.log("🔥 ANNOUNCEMENT FORM RENDERED");

  const isEdit = !!announcement;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "enter title",
      content: "enter content",
    },
  });

  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title || "",
        content: announcement.content || "",
      });
    } else {
      reset({
        title: "",
        content: "",
      });
    }
  }, [announcement, reset, isOpen]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Enter announcement title"
          {...register("title")}
          className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Content
        </label>
        <Textarea
          id="content"
          placeholder="Enter announcement details..."
          rows={6}
          {...register("content")}
          className={errors.content ? "border-destructive focus-visible:ring-destructive resize-none" : "resize-none"}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-9 rounded-xl cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Post Announcement"}
        </Button>
      </div>
    </form>
  );
}
