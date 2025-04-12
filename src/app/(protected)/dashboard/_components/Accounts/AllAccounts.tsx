import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TFetchedAccount } from "@/server/db/accounts"
import AccountForm from "./AccountForm"

export default function AllAccounts({
    allAccounts
} : {
    allAccounts: TFetchedAccount[]
}) {
    return (
        <div className="flex flex-col gap-4">
            {allAccounts.map(account => (
                <Card key={account.accountId} className='border border-color-border shadow-none'>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <p className="fs-h3">{account.accountName}</p>
                            <AccountForm accountTobeEdited={account}/>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p>Monthly Balance: ${account.accountMonthlyBalance < 0 ? 0 : account.accountMonthlyBalance}</p>
                        <p>{generateAccountDescription(account.accountMonthlyBalance)}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function generateAccountDescription(
    accountMonthlyBalance: number
): string {
    if (accountMonthlyBalance < 0) {
        return `You’ve overspent by $${Math.abs(accountMonthlyBalance)}. Top up your account by this amount to settle the balance.`;
    }

    if (accountMonthlyBalance === 0) {
        return `Balance is at exactly 0.`;
    }

    if (accountMonthlyBalance > 0) {
        return `Great job! You’ve saved $${accountMonthlyBalance} remaining in this account.`;
    }

    return ''; // fallback (shouldn't be hit)
}
