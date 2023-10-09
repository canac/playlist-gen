/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Label` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Label_userId_name_key" ON "Label"("userId", "name");
