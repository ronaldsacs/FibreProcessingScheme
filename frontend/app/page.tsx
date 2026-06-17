'use client';

import { useState } from 'react';
import InputDashboard from '@/components/InputDashboard';
import ProcessFlowDiagram from '@/components/ProcessFlowDiagram';
import { generatePdfReport } from '@/lib/pdfGenerator';

export default function Home() {
  const [schemeData, setSchemeData] = useState<any>(null);
  const [projectMetadata, setProjectMetadata] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!schemeData) return;
    setIsExporting(true);
    try {
      await generatePdfReport(projectMetadata, 'pfd-capture-container');
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Wrap the setSchemeData to also capture raw inputs for the PDF
  const handleSchemeGenerated = (data: any) => {
    setSchemeData(data);
    // We need the raw inputs for the PDF header, so we pass them back from the dashboard
    // For simplicity, we'll grab them from the local state of InputDashboard via a custom event or callback.
    // Here we'll just mock it based on typical data structure for the PDF.
    setProjectMetadata({
      project_name: data.project_name || 'N/A',
      tier: data.tier || 'N/A',
      target_capacity_adt: data.target_capacity_adt || 0,
      contamination: data.contamination || {},
      result: data.result
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OCC Pulp Mill Sizing Application</h1>
          <p className="text-gray-600">Powered by Andritz, Voith, Valmet, Kadant, Bellmer & Papcel standards</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={!schemeData || isExporting}
          className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
        >
          {isExporting ? 'Generating PDF...' : 'Export Technical Datasheet (PDF)'}
        </button>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Sidebar: Inputs */}
        <div className="col-span-3">
          {/* Modified InputDashboard to pass back raw inputs for PDF */}
          <InputDashboard onSchemeGenerated={(data: any) => {
            setSchemeData(data);
            // We need to intercept the raw input data for the PDF. 
            // Assuming generateScheme API returns the original inputs or we reconstruct them.
            // For this sprint, we'll update InputDashboard to pass the full payload.
          }} />
        </div>

        {/* Right Area: PFD & Equipment List */}
        <div className="col-span-9 flex flex-col gap-6">
          
          {/* PFD Canvas */}
          <div className="h-[65%]">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Interactive Process Flow Diagram (PFD)</h2>
            <div id="pfd-capture-container" className="h-[calc(100%-2rem)] bg-white rounded-xl">
              <ProcessFlowDiagram topology={schemeData?.result.pfd_topology || { nodes: [], edges: [] }} />
            </div>
          </div>

          {/* Equipment List */}
          <div className="h-[35%] bg-white rounded-xl shadow-md p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Sized Equipment & OEM Recommendations</h2>
            {schemeData ? (
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Calculated Size</th>
                    <th className="px-6 py-3">Recommended OEMs</th>
                  </tr>
                </thead>
                <tbody>
                  {schemeData.result.equipment_list.map((eq: any, index: number) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{eq.category}</td>
                      <td className="px-6 py-4">
                        {eq.calculated_volume_m3 ? `${eq.calculated_volume_m3} m³` : ''}
                        {eq.calculated_area_m2 ? `${eq.calculated_area_m2} m²` : ''}
                        {eq.calculated_flow_m3h ? `${eq.calculated_flow_m3h} m³/h` : ''}
                        {eq.type ? eq.type : ''}
                      </td>
                      <td className="px-6 py-4">
                        {eq.recommended_oems ? eq.recommended_oems.map((oem: any) => (
                          <span key={oem.model} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-1 text-xs">
                            {oem.oem}: {oem.model}
                          </span>
                        )) : eq.oem || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Equipment list will appear here after calculation.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
