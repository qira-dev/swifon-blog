import { Router } from "express";
import { db } from "@workspace/db";
import { postReviewsTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";

const router = Router();

/* ── List reviews for a post (public) ── */
router.get("/posts/:postId/reviews", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const reviews = await db
      .select({
        id: postReviewsTable.id,
        rating: postReviewsTable.rating,
        comment: postReviewsTable.comment,
        createdAt: postReviewsTable.createdAt,
        userId: postReviewsTable.userId,
        username: usersTable.username,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(postReviewsTable)
      .leftJoin(usersTable, eq(postReviewsTable.userId, usersTable.id))
      .where(eq(postReviewsTable.postId, postId))
      .orderBy(desc(postReviewsTable.createdAt));

    const count = reviews.length;
    const avgRating =
      count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    res.json({ reviews, count, avgRating: Math.round(avgRating * 10) / 10 });
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/* ── Submit a review (authenticated users, one per post, no updates) ── */
router.post("/posts/:postId/reviews", requireAuth, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const { rating, comment } = req.body;
    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const userId = req.userId!;

    const [existing] = await db
      .select({ id: postReviewsTable.id })
      .from(postReviewsTable)
      .where(
        and(
          eq(postReviewsTable.postId, postId),
          eq(postReviewsTable.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "You have already reviewed this post." });
      return;
    }

    const [created] = await db
      .insert(postReviewsTable)
      .values({ postId, userId, rating: ratingNum, comment: comment?.trim() || null })
      .returning();
    res.json({ review: created });
  } catch {
    res.status(500).json({ error: "Failed to submit review" });
  }
});

/* ── Delete a review (admins only) ── */
router.delete("/posts/:postId/reviews/:reviewId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userIsAdmin) {
      res.status(403).json({ error: "Only admins can delete reviews." });
      return;
    }

    const reviewId = parseInt(req.params.reviewId);

    const [review] = await db
      .select({ id: postReviewsTable.id })
      .from(postReviewsTable)
      .where(eq(postReviewsTable.id, reviewId))
      .limit(1);

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    await db.delete(postReviewsTable).where(eq(postReviewsTable.id, reviewId));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
