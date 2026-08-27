// src/components/layout/CartDrawer.tsx
'use client'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import { urlFor } from '../../../sanity/lib/image'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, clearCart } = useCart()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={closeCart}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-[380px] max-w-full h-full bg-[#111] border-l border-[#2a2a2a] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h2 className="font-bebas text-xl tracking-[4px]">YOUR CART</h2>
          <button onClick={closeCart} className="text-[#888] hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#888] text-xs tracking-[3px]">
              YOUR CART IS EMPTY
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-3 border border-[#2a2a2a] p-3">
                  <div className="w-16 h-16 bg-[#1a1a1a] flex-shrink-0 relative">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bebas tracking-[1px] text-sm leading-tight">{item.name}</p>
                    <p className="text-[#888] text-xs mt-0.5">{item.size} / {item.color}</p>
                    <p className="text-white text-xs mt-1">₦{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item._id, item.size, item.color, item.quantity - 1)} className="w-6 h-6 border border-[#2a2a2a] text-xs hover:border-white transition-colors">-</button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item._id, item.size, item.color, item.quantity + 1)} className="w-6 h-6 border border-[#2a2a2a] text-xs hover:border-white transition-colors">+</button>
                      <button onClick={() => removeItem(item._id, item.size, item.color)} className="ml-auto text-[#888] hover:text-[#ff2d2d] text-xs transition-colors">REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#2a2a2a] space-y-3">
          <div className="flex justify-between text-xs tracking-[2px] text-[#888]">
            <span>SUBTOTAL</span>
            <span className="text-white font-bebas text-base">₦{total().toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-[#555] tracking-[1px]">Shipping & taxes calculated at checkout</p>
          <a
            href="/checkout"
            onClick={closeCart}
            className="block w-full bg-[#ff2d2d] hover:bg-red-700 text-white text-center py-3 font-bebas text-lg tracking-[4px] transition-colors"
          >
            CHECKOUT
          </a>
          <button onClick={clearCart} className="w-full text-[#555] hover:text-[#888] text-xs tracking-[2px] transition-colors">
            CLEAR CART
          </button>
        </div>
      </div>
    </>
  )
}
