'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, idx) => {
            obj[header] = values[idx];
            return obj;
          }, {} as any);
        });
        setPreview(data);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        alert('Contacts imported successfully!');
        window.location.href = '/dashboard/contacts';
      }
    } catch (error) {
      alert('Import failed. Please check your file format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Import Contacts</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h1 className="text-xl font-bold text-white mb-2">Bulk Contact Import</h1>
          <p className="text-gray-300 mb-6">Upload a CSV file to import multiple contacts at once.</p>

          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-white">Click to upload CSV file</p>
              <p className="text-gray-400 text-sm mt-2">Format: name,phone,email (optional)</p>
            </label>
          </div>

          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Preview (first 5 rows)</h3>
              <div className="bg-white/5 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      {Object.keys(preview[0] || {}).map((header) => (
                        <th key={header} className="p-2 text-left text-gray-400">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/10">
                        {Object.values(row).map((value: any, colIdx) => (
                          <td key={colIdx} className="p-2 text-gray-300">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Contacts'}
          </button>

          <div className="mt-4 text-center">
            <a href="/sample-contacts.csv" className="text-orange-400 text-sm hover:underline">
              Download sample CSV template
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}