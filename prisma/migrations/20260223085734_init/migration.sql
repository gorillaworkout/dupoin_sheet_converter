-- CreateTable
CREATE TABLE "xero_tokens" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "tenantName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_balance_sheet_reports" (
    "id" SERIAL NOT NULL,
    "reportDate" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "xero_balance_sheet_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_balance_sheet_rows" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "period" TEXT NOT NULL,

    CONSTRAINT "xero_balance_sheet_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_profit_loss_reports" (
    "id" SERIAL NOT NULL,
    "fromDate" TEXT NOT NULL,
    "toDate" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB NOT NULL,

    CONSTRAINT "xero_profit_loss_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_profit_loss_rows" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "period" TEXT NOT NULL,

    CONSTRAINT "xero_profit_loss_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_transactions" (
    "id" SERIAL NOT NULL,
    "xeroId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "contactName" TEXT,
    "description" TEXT,
    "reference" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" TEXT NOT NULL,
    "accountCode" TEXT,
    "accountName" TEXT,
    "status" TEXT,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_accounts" (
    "id" SERIAL NOT NULL,
    "xeroId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "class" TEXT,
    "status" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xero_transactions_xeroId_key" ON "xero_transactions"("xeroId");

-- CreateIndex
CREATE INDEX "xero_transactions_date_idx" ON "xero_transactions"("date");

-- CreateIndex
CREATE INDEX "xero_transactions_type_idx" ON "xero_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "xero_accounts_xeroId_key" ON "xero_accounts"("xeroId");

-- AddForeignKey
ALTER TABLE "xero_balance_sheet_rows" ADD CONSTRAINT "xero_balance_sheet_rows_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "xero_balance_sheet_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xero_profit_loss_rows" ADD CONSTRAINT "xero_profit_loss_rows_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "xero_profit_loss_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
