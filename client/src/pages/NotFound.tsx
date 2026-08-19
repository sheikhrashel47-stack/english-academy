import { Button } from "@/components/ui/button";
/** Design reminder — even a missed route is a calm map detour, never a generic app failure. */
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="not-found-atlas">
      <section className="not-found-sheet">
        <div className="not-found-brand"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/HDBugHwgvZZHpDdM.png" alt="" /><span><strong>English</strong><em>Academy</em></span></div>
        <div className="not-found-pin"><MapPin size={25} /></div>
        <p className="card-kicker">Route 404 · detour</p>
        <h1>এই পথটি<br /><em>মানচিত্রে নেই।</em></h1>
        <p>চিন্তার কিছু নেই। তোমার শেখার পথটি এখনও ঠিক আছে—আমরা তোমাকে পরিচিত landmark-এ ফিরিয়ে দিই।</p>
        <Link href="/dashboard" className="not-found-return"><ArrowLeft size={16} /> আমার পথে ফিরি</Link>
        <div className="not-found-footer"><Compass size={15} /> Learning Compass · তোমার পরের পদক্ষেপ কাছে আছে</div>
      </section>
    </main>
  );
}
