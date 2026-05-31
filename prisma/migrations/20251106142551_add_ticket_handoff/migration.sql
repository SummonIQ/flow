-- CreateTable
CREATE TABLE "ticket_handoffs" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "instructions" TEXT,
    "requestedAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_handoffs_ticketId_createdAt_idx" ON "ticket_handoffs"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_handoffs_fromAgentId_idx" ON "ticket_handoffs"("fromAgentId");

-- CreateIndex
CREATE INDEX "ticket_handoffs_toAgentId_idx" ON "ticket_handoffs"("toAgentId");

-- AddForeignKey
ALTER TABLE "ticket_handoffs" ADD CONSTRAINT "ticket_handoffs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_handoffs" ADD CONSTRAINT "ticket_handoffs_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_handoffs" ADD CONSTRAINT "ticket_handoffs_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
