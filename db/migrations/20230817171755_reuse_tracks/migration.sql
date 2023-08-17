/*
  Warnings:

  - You are about to drop the column `albumId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `Track` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotifyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtistToTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabelToTrack` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[playlistId]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,spotifyTrackId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyTrackId` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_userId_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_labelId_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_B_fkey";

-- DropForeignKey
ALTER TABLE "_LabelToTrack" DROP CONSTRAINT "_LabelToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_LabelToTrack" DROP CONSTRAINT "_LabelToTrack_B_fkey";

-- DropIndex
DROP INDEX "Track_spotifyId_key";

-- DropIndex
DROP INDEX "User_spotifyId_key";

-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "playlistId" TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "albumId",
DROP COLUMN "explicit",
DROP COLUMN "name",
DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyTrackId" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "spotifyId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "_ArtistToTrack";

-- DropTable
DROP TABLE "_LabelToTrack";

-- CreateTable
CREATE TABLE "TrackLabel" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "labelId" INTEGER NOT NULL,

    CONSTRAINT "TrackLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyTrack" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,

    CONSTRAINT "SpotifyTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToSpotifyTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackLabel_trackId_labelId_key" ON "TrackLabel"("trackId", "labelId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToSpotifyTrack_AB_unique" ON "_ArtistToSpotifyTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToSpotifyTrack_B_index" ON "_ArtistToSpotifyTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Label_playlistId_key" ON "Label"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_userId_spotifyTrackId_key" ON "Track"("userId", "spotifyTrackId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_spotifyTrackId_fkey" FOREIGN KEY ("spotifyTrackId") REFERENCES "SpotifyTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackLabel" ADD CONSTRAINT "TrackLabel_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackLabel" ADD CONSTRAINT "TrackLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyTrack" ADD CONSTRAINT "SpotifyTrack_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToSpotifyTrack" ADD CONSTRAINT "_ArtistToSpotifyTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToSpotifyTrack" ADD CONSTRAINT "_ArtistToSpotifyTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "SpotifyTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
