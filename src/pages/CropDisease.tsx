import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockDiseases: Record<string, { name: string; confidence: number; severity: string; desc: string; pesticide: string; dosage: string; method: string; safety: string; buyLink: string }> = {
  default: {
    name: "Bacterial Leaf Blight",
    confidence: 87,
    severity: "Moderate",
    desc: "Caused by Xanthomonas oryzae. Leads to yellowing and wilting of leaves, reducing photosynthesis and yield.",
    pesticide: "Streptocycline + Copper Oxychloride",
    dosage: "1g + 3g per litre of water",
    method: "Foliar spray during early morning or late evening",
    safety: "Wear mask, gloves. Avoid spraying during rain or high wind.",
    buyLink: "https://www.flipkart.com/search?q=streptocycline",
  },
};

const CropDisease = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<typeof mockDiseases.default | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setLoading(true);
      setTimeout(() => {
        setResult(mockDiseases.default);
        setLoading(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2">🔬 AI Crop Disease Detection</h1>
      <p className="text-muted-foreground mb-8">Upload a photo of your crop to detect diseases instantly</p>

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-leaf-light/50 transition-colors mb-8"
      >
        {image ? (
          <img src={image} alt="Uploaded crop" className="max-h-64 mx-auto rounded-lg" />
        ) : (
          <>
            <Upload className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="font-display font-semibold text-lg mb-1">📸 Take Photo or Upload from Gallery</p>
            <p className="text-muted-foreground text-sm">Click here or drag & drop your crop image</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing crop image with AI...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Disease Result */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <h3 className="font-display font-bold text-lg">Disease Detected</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Disease</p>
                <p className="font-bold text-sm">{result.name}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-bold text-sm text-primary">{result.confidence}%</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Severity</p>
                <p className="font-bold text-sm text-accent">{result.severity}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="font-bold text-sm">Immediate Spray</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{result.desc}</p>
          </div>

          {/* Pesticide Recommendation */}
          <div className="bg-leaf-light border border-primary/20 rounded-xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">💊 Recommended Treatment</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Pesticide:</strong> {result.pesticide}</p>
              <p><strong>Dosage:</strong> {result.dosage}</p>
              <p><strong>Application:</strong> {result.method}</p>
              <p><strong>Safety:</strong> {result.safety}</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={result.buyLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent text-accent-foreground">Buy on Flipkart</Button>
              </a>
              <Button
                variant="outline"
                className="border-primary text-primary"
                onClick={() => navigate("/dashboard/report-problems", {
                  state: {
                    type: "🧪 Fertilizer Shortage",
                    description: `Disease Detected: ${result.name} (Confidence: ${result.confidence}%, Severity: ${result.severity}). ${result.desc}\nRecommended: ${result.pesticide} - ${result.dosage}`,
                    photo: image,
                  }
                })}
              >
                📧 Send Report to Welfare Office
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDisease;
