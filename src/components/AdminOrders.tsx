/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Eye, Phone, Trash2, SlidersHorizontal, Truck, Utensils, ShoppingBag, Pencil } from 'lucide-react';
import { Order, OrderItem, Product } from '../types';
import { printOrder } from "../utils/printOrder";
import { Settings } from "../types";
interface AdminOrdersProps {
  orders: Order[];
  products: Product[];
  onUpdateStatus: (
    id: number,
    status: Order["status"]
  ) => void;

  onDeleteOrder: (
    id: number
  ) => void;

  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

  settings: Settings;
}

export default function AdminOrders({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  selectedOrder,
  setSelectedOrder,
  settings,
  products
}: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const orderTypes = {
    delivery: { label: 'Livraison', icon: Truck, className: 'bg-sky-100 text-sky-800' },
    table: { label: 'Sur place', icon: Utensils, className: 'bg-violet-100 text-violet-800' },
    pickup: { label: 'À emporter', icon: ShoppingBag, className: 'bg-amber-100 text-amber-800' },
  } as const;
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  useEffect(() => {
    if (editingOrder) {
      setEditCustomerName(editingOrder.customerName);
      setEditPhone(editingOrder.phone);
      setEditAddress(editingOrder.address);
      setEditItems(editingOrder.items);
    }
  }, [editingOrder]);
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.id).includes(searchQuery) ||
      (order.customerName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order.phone || "").includes(searchQuery);

    const matchesStatus =
      filterStatus === "all" ||
      order.status === filterStatus;
    const matchesType =
      filterType === "all" ||
      (order.orderType || "delivery") === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });
  const editSubtotal = editItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = Number(editingOrder?.deliveryFee || 0);

  const editTotal = editSubtotal + deliveryFee;
  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-green">Gestion des commandes</h1>
          <p className="font-sans text-xs font-light text-brand-green/70 mt-1">
            Traitez, suivez, et mettez à jour l'évolution des livraisons en cours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(orderTypes).map(([type, config]) => {
          const Icon = config.icon;
          const count = orders.filter((order) => (order.orderType || 'delivery') === type).length;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`rounded-2xl border p-4 text-left transition-all ${filterType === type
                ? 'border-brand-gold bg-brand-ivory shadow-sm'
                : 'border-brand-green/10 bg-white hover:border-brand-gold/50'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-green">{config.label}</span>
                <span className={`rounded-full p-2 ${config.className}`}><Icon className="w-4 h-4" /></span>
              </div>
              <p className="mt-3 font-serif text-2xl font-bold text-brand-green">{count}</p>
              <p className="text-[10px] text-brand-green/60 uppercase tracking-wider">commandes</p>
            </button>
          );
        })}
      </div>

      {/* Sticky Filter Bar */}
      <div className="bg-brand-ivory rounded-2xl p-4 border border-brand-green/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search Input bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40 w-4 h-4" />
          <input
            type="search"
            placeholder="Rechercher (N°, nom, tél)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-green/5 border border-brand-green/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-brand-green placeholder-brand-green/40 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
          />
        </div>

        {/* Status Pills Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] uppercase font-bold text-brand-green/50 tracking-wider flex items-center gap-1.5 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrer:
          </span>
          {[

            { id: 'all', label: 'Tous' },
            { id: 'pending', label: 'En attente' },
            { id: 'confirmed', label: 'Confirmée' },
            { id: 'delivered', label: 'Livrées' },
            { id: 'cancelled', label: 'Annulées' }

          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer ${filterStatus === item.id
                ? 'bg-brand-green text-brand-ivory shadow-sm'
                : 'bg-brand-green/5 text-brand-green/75 hover:bg-brand-green/10'
                }`}
            >
              {item.label}
            </button>
          ))}
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            className="ml-auto bg-white border border-brand-green/10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-brand-green outline-none"
            aria-label="Filtrer par type de commande"
          >
            <option value="all">Tous les types</option>
            <option value="delivery">Livraison</option>
            <option value="table">Sur place</option>
            <option value="pickup">À emporter</option>
          </select>
        </div>
      </div>

      {/* Orders Table Row */}
      <div className="bg-brand-ivory rounded-3xl border border-brand-green/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-brand-green/50 font-sans font-light">
              Aucune commande trouvée pour vos critères de recherche.
            </div>
          ) : (
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-brand-green/5 text-brand-green/60 uppercase tracking-widest font-semibold text-[10px] border-b border-brand-green/10">
                  <th className="px-6 py-4">N° Commande</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">
                    TYPE
                  </th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Adresse / Quartier</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-green/5 text-brand-green/85 font-medium">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-green/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold">{order.id}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const type = order.orderType || 'delivery';
                        const config = orderTypes[type];
                        const Icon = config.icon;

                        return (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${config.className}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`tel:${order.phone}`}
                        className="flex items-center space-x-1.5 text-brand-green hover:text-brand-gold transition-colors font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate leading-tight">{order.address}</p>
                      <span className="text-[10px] text-brand-gold-dark font-semibold">
                        {order.neighborhood}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-serif font-bold text-brand-green-dark">
                      {order.total.toLocaleString()} DZD
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-brand-green/70 text-[11px] font-light">
                      {order.date}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            order.id,
                            e.target.value as Order['status']
                          )
                        }
                        className={`...
${order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'confirmed'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 border border-brand-green/10 hover:border-brand-green hover:bg-brand-green hover:text-brand-ivory rounded-full text-brand-green transition-all cursor-pointer"
                          title="Voir le bon de commande"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                          }}
                          className="p-2 rounded-full transition-all border border-amber-200 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600"
                          title="Modifier la commande"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printOrder(order, settings.phone)}
                          disabled={order.status !== "confirmed"}
                          className={`p-2 rounded-full transition-all
      ${order.status === "confirmed"
                              ? "border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 cursor-pointer"
                              : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }
    `}
                          title={
                            order.status === "confirmed"
                              ? "Imprimer"
                              : "Confirmez la commande d'abord"
                          }
                        >
                          🖨
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-500 hover:text-white rounded-full text-rose-600 transition-all cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Order Detailed Bill Modal overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 overflow-y-auto">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-brand-green/30 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-3xl bg-brand-ivory text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-brand-green/10 p-8">

              {/* Header Title info */}
              <div className="flex justify-between items-start pb-4 border-b border-brand-green/10">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-green">Bon de commande</h3>
                  <p className="font-sans text-[10px] font-mono mt-1 text-brand-green/60">
                    ID COMMANCHE : {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1 text-xs border border-brand-green/10 rounded-full hover:bg-brand-green hover:text-brand-ivory cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              {/* Client Information section */}
              <div className="py-4 space-y-2 border-b border-brand-green/10 font-sans text-xs text-brand-green/80">
                <p>
                  <strong className="text-brand-green">Client :</strong> {selectedOrder.customerName}
                </p>
                <p>
                  <strong className="text-brand-green">Téléphone :</strong> {selectedOrder.phone}
                </p>
                <p>
                  <strong className="text-brand-green">Quartier :</strong> {selectedOrder.neighborhood}
                </p>
                <p>
                  <strong className="text-brand-green">Adresse :</strong> {selectedOrder.address}
                </p>
                {selectedOrder.comment && (
                  <p className="italic bg-yellow-50 text-yellow-800 p-2.5 rounded-xl border border-yellow-100 font-light mt-1">
                    <strong className="not-italic text-yellow-905 font-semibold">Commentaire client :</strong> "{selectedOrder.comment}"
                  </p>
                )}
              </div>

              {/* Ordered Products list */}

              <div className="py-4 border-b border-brand-green/10">

                <h4 className="font-serif text-sm font-semibold text-brand-green mb-3">Détail des plats</h4>

                <ul className="space-y-3 font-sans text-xs">
                  {selectedOrder.items.map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-brand-green/5 pb-3"
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {item.quantity}×{" "}
                          <strong className="font-medium text-brand-green-dark">
                            {item.name}
                          </strong>
                        </span>

                        <span className="font-semibold text-brand-green/80">
                          {(item.price * item.quantity).toLocaleString()} DZD
                        </span>
                      </div>

                      {item.variant_name && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-medium">
                          📏 Taille : {item.variant_name}
                        </div>
                      )}

                      {item.option_name && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                          🧀 Option : {item.option_name}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order total costs sum */}
              <div className="pt-4 font-sans text-xs space-y-2">
                <div className="flex justify-between text-brand-green/70">
                  <span>Sous-total</span>
                  <span>{selectedOrder.subtotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-brand-green/70">
                  <span>Lrais de livraison</span>
                  <span>{selectedOrder.deliveryFee.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between font-serif text-lg font-bold text-brand-green-dark pt-2 border-t border-brand-green/5">
                  <span>Montant Total</span>
                  <span className="text-brand-gold-dark">{selectedOrder.total.toLocaleString()} DZD</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-auto p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Modifier la commande
              </h2>

              <button
                onClick={() => setEditingOrder(null)}
                className="text-red-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <p>
              <strong>Commande :</strong> #{editingOrder.id}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Client
              </label>

              <input
                type="text"
                value={editCustomerName}
                onChange={(e) => setEditCustomerName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Téléphone
              </label>

              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Adresse
              </label>

              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-3">
              Produits
            </h3>

            <div className="space-y-3">
              {editItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">
                      {item.name}
                    </div>

                    <div className="text-sm text-gray-500">
                      {item.price} DA
                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => {
                        setEditItems(prev =>
                          prev
                            .map(p =>
                              p.id === item.id
                                ? {
                                  ...p,
                                  quantity: p.quantity - 1,
                                }
                                : p
                            )
                            .filter(p => p.quantity > 0)
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-red-100"
                    >
                      -
                    </button>

                    <span className="font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => {
                        setEditItems(prev =>
                          prev.map(p =>
                            p.id === item.id
                              ? {
                                ...p,
                                quantity: p.quantity + 1,
                              }
                              : p
                          )
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-green-100"
                    >
                      +
                    </button>

                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="mt-5 w-full py-3 rounded-xl bg-brand-green text-white hover:bg-brand-gold transition-all"
            >
              + Ajouter un produit
            </button>
            <div className="border-t mt-6 pt-5 space-y-3">

              <div className="flex justify-between text-lg">
                <span>Sous-total</span>
                <span>{editSubtotal} DA</span>
              </div>

              <div className="flex justify-between text-lg">
                <span>Livraison</span>
                <span>{deliveryFee} DA</span>
              </div>

              <div className="flex justify-between text-2xl font-bold text-brand-green border-t pt-4">
                <span>TOTAL</span>
                <span>{editTotal} DA</span>
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() => setEditingOrder(null)}
                className="px-6 py-3 rounded-xl border"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  try {
                    console.log("SENDING ITEMS");
                    console.log(JSON.stringify(editItems, null, 2));
                    await fetch(
                      `https://casa-verde-production-1d5f.up.railway.app/api/orders/${editingOrder?.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          customerName: editCustomerName,
                          phone: editPhone,
                          address: editAddress,

                          items: editItems,

                          subtotal: editSubtotal,
                          total: editTotal,
                        }),
                      }
                    );

                    alert("Commande modifiée avec succès.");

                    setEditingOrder(null);

                    window.location.reload();

                  } catch (err) {
                    console.error(err);
                    alert("Erreur lors de la modification.");
                  }
                }}
                className="px-6 py-3 rounded-xl bg-brand-green text-white"
              >
                Enregistrer
              </button>

            </div>
          </div>
        </div>

      )}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">

          <div className="bg-white rounded-2xl w-[600px] max-h-[80vh] overflow-auto p-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold text-brand-green">
                Ajouter un produit
              </h2>

              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-red-500 text-2xl"
              >
                ×
              </button>

            </div>

            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full border rounded-xl px-4 py-3 mb-5"
            />

            <div className="space-y-2">

              {products.map(product => (

                <div
                  key={product.id}
                  className="flex justify-between items-center border rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
                >

                  <div>

                    <div className="font-semibold">
                      {product.name}
                    </div>

                    <div className="text-sm text-gray-500">
                      {product.price} DA
                    </div>

                  </div>

                  <button
                    onClick={() => {

                      setEditItems(prev => {

                        const existing = prev.find(
                          p =>
                            p.productId === product.id.toString()
                        );

                        if (existing) {
                          return prev.map(p =>
                            p.productId === product.id.toString()
                              ? {
                                ...p,
                                quantity: p.quantity + 1
                              }
                              : p
                          );
                        }

                        return [
                          ...prev,
                          {
                            id: Date.now(),
                            productId: product.id.toString(),
                            name: product.name,
                            price: Number(product.price),
                            quantity: 1,
                            variant_name: "",
                            option_name: "",
                          }
                        ];

                      });

                      setShowAddProductModal(false);

                    }}

                    className="px-3 py-1 rounded-lg bg-brand-green text-white"
                  >
                    Ajouter
                  </button>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
