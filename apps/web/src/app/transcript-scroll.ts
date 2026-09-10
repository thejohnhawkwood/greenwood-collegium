export type TranscriptViewport = {
  scrollTop: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
};

// Allow for fractional browser measurements at the end of a scroll.
const BOTTOM_TOLERANCE = 2;

export class TranscriptScroll {
  private following = true;
  private unread = false;
  private lastEntryId: string | undefined;

  entriesChanged(viewport: TranscriptViewport, lastEntryId: string | undefined): boolean {
    const added = lastEntryId !== this.lastEntryId;
    this.lastEntryId = lastEntryId;
    if (this.following) {
      return this.jumpToLatest(viewport);
    }
    this.unread ||= added;
    return this.unread;
  }

  scrolled(viewport: TranscriptViewport): boolean {
    this.following =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= BOTTOM_TOLERANCE;
    if (this.following) {
      this.unread = false;
    }
    return this.unread;
  }

  resized(viewport: TranscriptViewport): boolean {
    return this.following ? this.jumpToLatest(viewport) : this.scrolled(viewport);
  }

  jumpToLatest(viewport: TranscriptViewport): boolean {
    viewport.scrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    this.following = true;
    this.unread = false;
    return false;
  }
}
