-- DropForeignKey
ALTER TABLE IF EXISTS "mantenimiento" DROP CONSTRAINT IF EXISTS "mantenimiento_equipoId_fkey";

-- DropTable
DROP TABLE IF EXISTS "mantenimiento";

-- DropTable
DROP TABLE IF EXISTS "equipo";

-- CreateTable
CREATE TABLE "equipo" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "cliente" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "comentarios" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'Ingresado',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimiento" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "componente" TEXT,
    "observacion" TEXT NOT NULL DEFAULT '',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipo_estado_idx" ON "equipo"("estado");

-- CreateIndex
CREATE INDEX "equipo_tipo_idx" ON "equipo"("tipo");

-- CreateIndex
CREATE INDEX "mantenimiento_equipoId_idx" ON "mantenimiento"("equipoId");

-- AddForeignKey
ALTER TABLE "mantenimiento" ADD CONSTRAINT "mantenimiento_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
