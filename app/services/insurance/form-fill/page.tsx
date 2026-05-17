import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import PdfAutofillDemo from "@/components/insurance/pdf-autofill-demo";

export const metadata: Metadata = {
  title: "Broker PDF Autofill | Salience",
  description: "Upload a fillable broker PDF, add notes or a voice note, and generate an editable filled PDF.",
};

export default function InsuranceFormFillPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fbf7ef_0%,#ffffff_48%,#f2eadb_100%)] pt-24 md:pt-28">
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <PdfAutofillDemo />
        </section>
      </main>
    </>
  );
}
