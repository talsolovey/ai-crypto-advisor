-- CreateTable
CREATE TABLE "DailyInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailyInsight_date_idx" ON "DailyInsight"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyInsight_userId_date_key" ON "DailyInsight"("userId", "date");
