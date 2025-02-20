import { getAllAccounts, TFetchedAccountWithChildTransactionCount } from "@/server/db/accounts";
import AccountForm from "./AccountForm";

export default async function AccountList({
    userId,
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allAccounts: TFetchedAccountWithChildTransactionCount[] = [];

    try {
        allAccounts = await getAllAccounts(userId)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className="account-list flex flex-col gap-8">

                        {allAccounts.length > 0 
                            ? (
                                allAccounts.map(account => (
                                    <div key={account.accountId} className="account-item border border-color-border p-6 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p>{account.accountName}</p>
                                            <AccountForm accountTobeEdited={account}/>
                                        </div>
                                        <p>Balance - ${account.accountBalance}</p>
                                    </div>
                                ))
                            )
                            : <p>No Accounts Found.</p>
                        }

                    </div>
                )
            }
        </>
    )
}