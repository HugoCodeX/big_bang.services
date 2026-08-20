-- CreateTable
CREATE TABLE "campoCustom" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campoCustom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campoCustom_equipoId_idx" ON "campoCustom"("equipoId");

-- AddForeignKey
ALTER TABLE "campoCustom" ADD CONSTRAINT "campoCustom_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;