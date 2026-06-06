import { UploadCSV } from "@/components/transactions/UploadCSV"
import { PollBank } from "@/components/transactions/PollBank"

export default function TransactionImportPage() {
  return (
    <main className="container mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or sync directly with your connected bank.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UploadCSV />
        <PollBank />
      </div>
    </main>
  )
}