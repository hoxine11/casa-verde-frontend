import { CashSession } from "../types";

interface Props {
  history: CashSession[];
}

export default function AdminCashHistory({
  history,
}: Props) {

  return (

    <div className="space-y-5">

      <h1 className="text-3xl font-bold text-brand-green">
        Historique des clôtures
      </h1>

      {history.length === 0 ? (

        <div className="bg-white rounded-2xl p-10 text-center shadow">

          Aucune clôture disponible.

        </div>

      ) : (

        history.map(session => (

          <div
            key={session.id}
            className="bg-white rounded-2xl shadow p-6"
          >

            <div className="flex justify-between">

              <div>

                <div className="text-xl font-bold">

                  {new Date(session.opened_at).toLocaleDateString()}

                </div>

                <div className="text-gray-500 mt-1">

                  {new Date(session.opened_at).toLocaleTimeString()}
                  {"  →  "}
                  {session.closed_at
                    ? new Date(session.closed_at).toLocaleTimeString()
                    : "-"}

                </div>

              </div>

              <button
                className="px-4 py-2 rounded-xl bg-brand-green text-white"
              >
                🖨️ Imprimer
              </button>

            </div>

            <div className="grid grid-cols-4 gap-6 mt-8">

              <div>

                <div className="text-gray-500">
                  Commandes
                </div>

                <div className="text-2xl font-bold">
                  {session.total_orders}
                </div>

              </div>

              <div>

                <div className="text-gray-500">
                  Ventes
                </div>

                <div className="text-2xl font-bold">

                  {Number(session.total_sales).toLocaleString()} DA

                </div>

              </div>

              <div>

                <div className="text-gray-500">
                  Livraison
                </div>

                <div className="text-2xl font-bold">

                  {Number(session.total_delivery).toLocaleString()} DA

                </div>

              </div>

              <div>

                <div className="text-gray-500">
                  TOTAL
                </div>

                <div className="text-2xl font-bold text-brand-green">

                  {Number(session.grand_total).toLocaleString()} DA

                </div>

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  );

}