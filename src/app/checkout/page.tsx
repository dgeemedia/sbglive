'use client'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',phone:'',address:'',city:'',state:'' })
  const [loading, setLoading] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[e.target.name]:e.target.value}))

  const handleCheckout = async () => {
    const required = ['firstName','lastName','email','phone','address','city','state']
    for (const field of required) {
      if (!form[field as keyof typeof form]) { toast.error(`Please fill in ${field}`); return }
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          email:form.email, amount:total(),
          metadata:{
            ...form,
            items:items.map(i=>({productName:i.name,productId:i._id,size:i.size,color:i.color,quantity:i.quantity,price:i.price})),
            custom_fields:[
              {display_name:'Customer Name',variable_name:'customer_name',value:`${form.firstName} ${form.lastName}`},
              {display_name:'Phone',variable_name:'phone',value:form.phone},
              {display_name:'Delivery',variable_name:'address',value:`${form.address}, ${form.city}, ${form.state}`},
            ]
          }
        }),
      })
      const data = await res.json()
      if (data.authorization_url) { window.location.href = data.authorization_url }
      else { toast.error(data.error||'Payment initialization failed') }
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const ic = "w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm tracking-[1px] focus:border-white focus:outline-none transition-colors placeholder-[#555]"
  const lc = "block text-xs tracking-[2px] text-[#888] mb-1.5"

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div>
        <h1 className="font-bebas text-3xl tracking-[4px] mb-6">CHECKOUT</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lc}>FIRST NAME</label><input name="firstName" value={form.firstName} onChange={handleChange} className={ic} placeholder="Tunde" /></div>
            <div><label className={lc}>LAST NAME</label><input name="lastName" value={form.lastName} onChange={handleChange} className={ic} placeholder="Bakare" /></div>
          </div>
          <div><label className={lc}>EMAIL</label><input name="email" type="email" value={form.email} onChange={handleChange} className={ic} placeholder="tunde@example.com" /></div>
          <div><label className={lc}>PHONE</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} className={ic} placeholder="+234 800 000 0000" /></div>
          <div><label className={lc}>DELIVERY ADDRESS</label><input name="address" value={form.address} onChange={handleChange} className={ic} placeholder="12 Bode Thomas St, Surulere" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lc}>CITY</label><input name="city" value={form.city} onChange={handleChange} className={ic} placeholder="Lagos" /></div>
            <div><label className={lc}>STATE</label><input name="state" value={form.state} onChange={handleChange} className={ic} placeholder="Lagos State" /></div>
          </div>
        </div>
        <button onClick={handleCheckout} disabled={loading} className="w-full mt-6 bg-[#ff2d2d] hover:bg-red-700 disabled:bg-[#555] text-white py-4 font-bebas text-xl tracking-[4px] transition-colors">
          {loading ? 'PROCESSING...' : `PAY ₦${total().toLocaleString()}`}
        </button>
        <p className="text-[#555] text-xs text-center mt-3 tracking-[1px]">Secured by Paystack · Cards · Bank Transfer · USSD</p>
      </div>
      <div>
        <h2 className="font-bebas text-xl tracking-[4px] mb-4 text-[#888]">ORDER SUMMARY</h2>
        <div className="space-y-3">
          {items.map(item=>(
            <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-3 border border-[#2a2a2a] p-3">
              <div className="w-16 h-16 bg-[#1a1a1a] flex-shrink-0 relative">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover"/>}
              </div>
              <div className="flex-1">
                <p className="font-bebas text-sm tracking-[1px]">{item.name}</p>
                <p className="text-[#888] text-xs">{item.size} / {item.color} · Qty: {item.quantity}</p>
                <p className="text-white text-xs mt-1">₦{(item.price*item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#2a2a2a] mt-4 pt-4 flex justify-between">
          <span className="text-[#888] text-xs tracking-[2px]">TOTAL</span>
          <span className="font-bebas text-xl text-[#c8a96e]">₦{total().toLocaleString()} NGN</span>
        </div>
      </div>
    </div>
  )
}
