import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!orderId) {
        setStatus("failed");
        return;
      }

      try {
        // We just need to fetch the details since verification happened on the previous page
        const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/bookings/reference/${orderId}`);
        const data = await response.json();

        if (response.ok && data) {
          setBooking(data);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setStatus("failed");
      }
    };

    fetchBookingDetails();
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-bold text-navy-950">Verifying Payment...</h1>
          <p className="text-navy-950/40 mt-2 text-sm uppercase tracking-widest font-bold">Please do not refresh the page</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-luxury border border-sand-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-navy-950 mb-4">Payment Failed</h1>
          <p className="text-navy-950/60 mb-8 leading-relaxed">
            We couldn't verify your payment. If money was deducted, it will be refunded within 5-7 business days.
          </p>
          <div className="space-y-4">
            <Button className="w-full rounded-2xl h-14 bg-navy-950 text-white" onClick={() => navigate("/checkout")}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full rounded-2xl h-14" onClick={() => navigate("/contact")}>
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 pt-32 pb-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[4rem] overflow-hidden shadow-luxury border border-sand-100">
          <div className="bg-navy-950 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="w-24 h-24 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold">
              <CheckCircle2 className="w-12 h-12 text-navy-950" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Booking Confirmed!</h1>
            <p className="text-white/60 uppercase tracking-[0.2em] text-xs font-bold">Reference: {orderId}</p>
          </div>

          <div className="p-12 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-bold text-navy-950/30 uppercase tracking-widest mb-4">Resort Details</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-sm">
                      <img src={booking?.resort?.images?.[0] || "https://images.unsplash.com/photo-1548013146-72479768bbaa"} alt="Resort" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-navy-950">{booking?.resort?.name}</h4>
                      <p className="text-sm text-navy-950/50 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-500" /> Hampi, Karnataka
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-navy-950/30 uppercase tracking-widest mb-2">Check-In</h3>
                    <p className="font-bold text-navy-950 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-500" /> {new Date(booking?.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-navy-950/30 uppercase tracking-widest mb-2">Check-Out</h3>
                    <p className="font-bold text-navy-950 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-500" /> {new Date(booking?.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-sand-50 rounded-[3rem] p-10 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-sand-200">
                  <span className="text-navy-950/40 text-sm font-medium">Payment Status</span>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Paid Successfully
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-950/40 text-sm font-medium">Total Paid</span>
                  <span className="text-2xl font-bold text-navy-950">₹{booking?.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="pt-6 space-y-4">
                  <Button className="w-full rounded-2xl h-14 bg-navy-950 text-white group" onClick={() => navigate("/dashboard/bookings")}>
                    Manage My Bookings
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-[10px] text-navy-950/30 italic text-center leading-relaxed">
                    A confirmation email with the itinerary has been sent to your registered address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
