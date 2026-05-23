-- AlterTable
ALTER TABLE "photos" ADD COLUMN "mood2" TEXT;
ALTER TABLE "photos" ADD COLUMN "secret_message" TEXT;

-- CreateTable
CREATE TABLE "photo_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photo_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "viewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photo_visits_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "photo_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "photo_visits_photo_id_idx" ON "photo_visits"("photo_id");

-- CreateIndex
CREATE INDEX "photo_visits_user_id_idx" ON "photo_visits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_visits_photo_id_user_id_key" ON "photo_visits"("photo_id", "user_id");
