import React from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import KartaDrogowa from "./KartaDrogowa";

const MM_TO_PX = 96 / 25.4;

const generatePDFFromKartaDrogowa = async (ref, format = 'A4') => {
  if (!ref?.current) throw new Error('Brak elementu do konwersji');

  const html2canvas = (await import('html2canvas')).default;

  const isA5 = format === 'A5';
  const pageW_mm = isA5 ? 148 : 210;
  const pageH_mm = isA5 ? 210 : 297;

  const pageW_px = Math.round(pageW_mm * MM_TO_PX);

  const canvas = await html2canvas(ref.current, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: pageW_px,
    windowWidth: pageW_px,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA5 ? 'a5' : 'a4',
    compress: true,
  });

  const imgW_mm = pageW_mm;
  const imgH_mm = (canvas.height / canvas.width) * pageW_mm;
  const finalH = Math.min(imgH_mm, pageH_mm);

  // offsetY ujemny przesuwa obraz o 3mm w górę względem strony PDF
  const offsetY = -20;
  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    offsetY,
    imgW_mm,
    finalH
  );

  return pdf;
};

export default function TripCardPDF({ trip, vehicle, driver, company, format = 'A4' }) {
  const [loading, setLoading] = React.useState(false);
  const [rendered, setRendered] = React.useState(false);
  const kartaRef = React.useRef(null);

  const isA5 = format === 'A5';
  const wrapperWidthPx = Math.round((isA5 ? 148 : 210) * MM_TO_PX);

  const generatePDF = React.useCallback(async () => {
    setRendered(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const pdf = await generatePDFFromKartaDrogowa(kartaRef, format);
      return pdf;
    } finally {
      setRendered(false);
    }
  }, [format]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const pdf = await generatePDF();
      const name = trip?.cardNumber || String(trip?.id || '').slice(-6).toUpperCase() || 'karta';
      pdf.save(`karta-drogowa-${name}.pdf`);
    } catch (err) {
      console.error('Błąd generowania PDF:', err);
      alert('Nie udało się wygenerować PDF. Sprawdź konsolę.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const pdf = await generatePDF();
      const url = URL.createObjectURL(pdf.output('blob'));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Błąd podglądu PDF:', err);
      alert('Nie udało się wygenerować podglądu. Sprawdź konsolę.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {rendered && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            zIndex: -1000,
            pointerEvents: 'none',
            background: 'white',
            width: `${wrapperWidthPx}px`,
            overflow: 'hidden',
          }}
        >
          <KartaDrogowa
            ref={kartaRef}
            trip={trip}
            vehicle={vehicle}
            driver={driver}
            company={company}
            format={format}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          {loading ? 'Generuję...' : 'Podgląd'}
        </Button>

        <Button
          onClick={handleDownload}
          size="sm"
          disabled={loading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Generuję...' : 'Pobierz PDF'}
        </Button>
      </div>
    </>
  );
}