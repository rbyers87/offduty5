import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

const OffDutyReportForm = () => {
  const [formData, setFormData] = useState({
    badge: '',
    date: '',
    beginTime: '',
    endTime: '',
    date2: '',
    name: '',
    businessName: '',
    businessLocation: '',
    billTo: '',
    unit: '',
    totalHours: '',
    hourlyRate: '',
    rate: '',
    shift: '', // 'Day' or 'Night'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateFilledPdf = async () => {
    const response = await fetch('/Fillable - Off Duty Vehicle Usage Report.pdf');
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    form.getTextField('Badge').setText(formData.badge);
    form.getTextField('Date').setText(formData.date);
    form.getTextField('Begin Time').setText(formData.beginTime);
    form.getTextField('End Time').setText(formData.endTime);
    form.getTextField('Date_2').setText(formData.date2);
    form.getTextField('Name').setText(formData.name);
    form.getTextField('BusinessName').setText(formData.businessName);
    form.getTextField('BusinessLocation').setText(formData.businessLocation);
    form.getTextField('BillToNameAddress').setText(formData.billTo);
    form.getTextField('Unit').setText(formData.unit);
    form.getTextField('TotalNumberofHours').setText(formData.totalHours);
    form.getTextField('OfficersHourlyRate').setText(formData.hourlyRate);
    form.getTextField('Rate').setText(formData.rate);

    if (formData.shift === 'Day') {
      form.getCheckBox('CheckBox7').check();
    } else if (formData.shift === 'Night') {
      form.getCheckBox('CheckBox8').check();
    }

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'filled-vehicle-report.pdf');
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold">Off Duty Vehicle Usage Report</h2>

      {[
        { label: 'Badge', name: 'badge' },
        { label: 'Date', name: 'date' },
        { label: 'Begin Time', name: 'beginTime' },
        { label: 'End Time', name: 'endTime' },
        { label: 'Date (again)', name: 'date2' },
        { label: 'Name', name: 'name' },
        { label: 'Business Name', name: 'businessName' },
        { label: 'Business Location', name: 'businessLocation' },
        { label: 'Bill To Name & Address', name: 'billTo' },
        { label: 'Unit', name: 'unit' },
        { label: 'Total Hours', name: 'totalHours' },
        { label: 'Hourly Rate', name: 'hourlyRate' },
        { label: 'Rate', name: 'rate' },
      ].map(({ label, name }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <input
            type="text"
            name={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700">Shift</label>
        <select
          name="shift"
          value={formData.shift}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Shift</option>
          <option value="Day">Day</option>
          <option value="Night">Night</option>
        </select>
      </div>

      <button
        onClick={generateFilledPdf}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
      >
        Download Filled Report
      </button>
    </div>
  );
};

export default OffDutyReportForm;
