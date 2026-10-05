import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, VaultPerson, VaultTransaction } from '../types';

export const generateMonthlyReportPDF = (params: {
  monthName: string;
  year: number;
  month: number;
  currency: string;
  userName: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  friendsReceivable: number;
  friendsPayable: number;
  vaultTotalHeld: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  transactions: Transaction[];
}) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate 500

  // 1. Header & Brand
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KhataFlow', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Hisaab rakho. Sukoon rakho.  |  Monthly Financial Statement', 14, 24);

  // Month & User Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(params.monthName, 196, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Account: ${params.userName}`, 196, 24, { align: 'right' });

  let y = 44;

  // 2. Report Tagline banner
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...darkColor);
  doc.text('"A month of money, in one view. Track today, control tomorrow."', 18, y + 6.5);
  y += 18;

  // 3. Two Pillars Summary Cards (Personal & Friends - Vault strictly separated)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('1. Personal Finances', 14, y);
  doc.text('2. Friends & Udhaar', 106, y);
  y += 4;

  // Personal Card (wider, elegant)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 252, 250);
  doc.roundedRect(14, y, 88, 38, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Total Income:', 18, y + 9);
  doc.text('Total Expenses:', 18, y + 19);
  doc.text('Net Savings:', 18, y + 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`${params.currency} ${params.totalIncome.toLocaleString()}`, 96, y + 9, { align: 'right' });
  doc.setTextColor(239, 68, 68); // Red
  doc.text(`${params.currency} ${params.totalExpenses.toLocaleString()}`, 96, y + 19, { align: 'right' });
  doc.setTextColor(...darkColor);
  doc.text(`${params.currency} ${params.savings.toLocaleString()}`, 96, y + 29, { align: 'right' });

  // Friends Card
  doc.setFillColor(255, 251, 245);
  doc.roundedRect(106, y, 90, 38, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('You will receive (Receivable):', 110, y + 11);
  doc.text('You will pay (Payable):', 110, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(`${params.currency} ${params.friendsReceivable.toLocaleString()}`, 190, y + 11, { align: 'right' });
  doc.setTextColor(234, 88, 12); // Orange
  doc.text(`${params.currency} ${params.friendsPayable.toLocaleString()}`, 190, y + 23, { align: 'right' });

  y += 46;

  // 4. Expense Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('Monthly Expense Breakdown by Category', 14, y);
  y += 4;

  const categoryRows = params.categoryBreakdown.map((item) => [
    item.category,
    `${params.currency} ${item.amount.toLocaleString()}`,
    `${item.percentage}%`,
  ]);

  if (categoryRows.length === 0) {
    categoryRows.push(['No expenses recorded for this month', '-', '-']);
  }

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Amount', 'Share of Total']],
    body: categoryRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 42, halign: 'right' },
    },
  });

  // 5. Recent Month Transactions Table
  const lastTableY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('Transactions Log', 14, lastTableY);

  const txRows = params.transactions.slice(0, 18).map((tx) => [
    tx.date,
    tx.description,
    tx.category,
    tx.type.toUpperCase(),
    `${tx.type === 'expense' ? '-' : '+'}${params.currency} ${tx.amount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: lastTableY + 4,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: txRows.length > 0 ? txRows : [['-', 'No transactions recorded', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: darkColor, textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 68 },
      2: { cellWidth: 36 },
      3: { cellWidth: 24 },
      4: { cellWidth: 28, halign: 'right' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `KhataFlow • Generated on ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`,
      105,
      288,
      { align: 'center' }
    );
  }

  doc.save(`KhataFlow-Monthly-Report-${params.year}-${String(params.month).padStart(2, '0')}.pdf`);
};

export const generateYearlyReportPDF = (params: {
  year: number;
  currency: string;
  userName: string;
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  highestMonth: { name: string; amount: number };
  lowestMonth: { name: string; amount: number };
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyBreakdown: { monthName: string; income: number; expenses: number; net: number }[];
}) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [16, 185, 129];
  const darkColor: [number, number, number] = [15, 23, 42];

  // Header banner
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KhataFlow', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('One year. Every rupee. One clear picture.  |  Annual Financial Audit', 14, 24);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Year ${params.year}`, 196, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`User: ${params.userName}`, 196, 24, { align: 'right' });

  let y = 44;

  // Annual Totals
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Annual Financial Performance', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Total Annual Income', 'Total Annual Expenses', 'Total Net Savings', 'Savings Rate']],
    body: [
      [
        `${params.currency} ${params.totalIncome.toLocaleString()}`,
        `${params.currency} ${params.totalExpenses.toLocaleString()}`,
        `${params.currency} ${params.totalSaved.toLocaleString()}`,
        params.totalIncome > 0
          ? `${Math.round((params.totalSaved / params.totalIncome) * 100)}%`
          : '0%',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9.5, halign: 'center', cellPadding: 4 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Highs and Lows
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 88, 22, 2, 2, 'FD');
  doc.roundedRect(108, y, 88, 22, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Highest Spending Month', 20, y + 8);
  doc.text('Lowest Spending Month', 114, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(239, 68, 68);
  doc.text(`${params.highestMonth.name} (${params.currency} ${params.highestMonth.amount.toLocaleString()})`, 20, y + 16);

  doc.setTextColor(16, 185, 129);
  doc.text(`${params.lowestMonth.name} (${params.currency} ${params.lowestMonth.amount.toLocaleString()})`, 114, y + 16);

  y += 30;

  // Monthly Progression Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Month-by-Month Statement', 14, y);
  y += 4;

  const monthRows = params.monthlyBreakdown.map((m) => [
    m.monthName,
    `${params.currency} ${m.income.toLocaleString()}`,
    `${params.currency} ${m.expenses.toLocaleString()}`,
    `${params.currency} ${m.net.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Month', 'Income', 'Expenses', 'Net Balance']],
    body: monthRows,
    theme: 'striped',
    headStyles: { fillColor: darkColor, textColor: 255 },
    styles: { fontSize: 8.5, cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 44, halign: 'right' },
      2: { cellWidth: 44, halign: 'right' },
      3: { cellWidth: 44, halign: 'right' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`KhataFlow • Annual Report ${params.year} • Page ${i} of ${pageCount}`, 105, 288, { align: 'center' });
  }

  doc.save(`KhataFlow-Yearly-Report-${params.year}.pdf`);
};

export const generateMoneyCustodyPDF = (params: {
  currency: string;
  userName: string;
  people: VaultPerson[];
  transactions: VaultTransaction[];
  getPersonBalance: (id: string) => { deposited: number; returned: number; holding: number };
  totalHeld: number;
}) => {
  const doc = new jsPDF();
  const darkColor: [number, number, number] = [15, 23, 42];
  const vaultBlue: [number, number, number] = [37, 99, 235]; // Royal Blue

  // Header
  doc.setFillColor(...vaultBlue);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KhataFlow Money Vault', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Money Custody Report (Amanat Ledger)', 14, 25);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.text('Tagline: "Their money. Your record. Not yours, but still your responsibility."', 14, 31);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Custodian: ${params.userName}`, 196, 20, { align: 'right' });
  doc.text(`As of: ${new Date().toLocaleDateString()}`, 196, 28, { align: 'right' });

  let y = 46;

  // Important Notice Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...vaultBlue);
  doc.text('LEGAL & FINANCIAL ACCOUNTING NOTICE:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'The funds listed herein belong entirely to third-party individuals and are strictly held in custody.',
    18,
    y + 11
  );

  y += 24;

  // Custody Table
  const tableRows = params.people.map((person) => {
    const bal = params.getPersonBalance(person.id);
    return [
      person.name,
      person.phone || '—',
      `${params.currency} ${bal.deposited.toLocaleString()}`,
      `${params.currency} ${bal.returned.toLocaleString()}`,
      `${params.currency} ${bal.holding.toLocaleString()}`,
      bal.holding > 0 ? '🟢 Holding' : '⚪ Returned',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Person / Owner', 'Contact', 'Total Received', 'Total Returned', 'Current Balance', 'Status']],
    body: tableRows.length > 0 ? tableRows : [['No vault deposits found', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: vaultBlue, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 22, halign: 'center' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Grand Total Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(110, finalY, 86, 20, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text('Total Custody Money Held:', 116, finalY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...vaultBlue);
  doc.text(`${params.currency} ${params.totalHeld.toLocaleString()}`, 116, finalY + 16);

  // Detailed Movement Ledger (Deposits & Returns Log with Dates)
  let detailY = finalY + 28;
  if (detailY > 230) {
    doc.addPage();
    detailY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Detailed Custody Movements (Deposits & Returns by Date)', 14, detailY);
  detailY += 4;

  const movementRows = params.transactions.map((tx) => {
    const person = params.people.find((p) => p.id === tx.vaultPersonId);
    const isDeposit = tx.type === 'deposit';
    return [
      tx.date,
      person?.name || 'Vault Person',
      isDeposit ? '📥 Jamah (Deposit)' : '📤 Wapis (Returned)',
      `${params.currency} ${tx.amount.toLocaleString()}`,
      tx.description || 'Safekeeping record',
    ];
  });

  autoTable(doc, {
    startY: detailY,
    head: [['Date', 'Owner / Person', 'Movement Type', 'Amount', 'Reason / Notes']],
    body:
      movementRows.length > 0
        ? movementRows
        : [['No deposit or return movements recorded yet', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: darkColor, textColor: 255 },
    styles: { fontSize: 8.5, cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 50 },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `KhataFlow Custody Ledger • Generated securely • Page ${i} of ${pageCount}`,
      105,
      288,
      { align: 'center' }
    );
  }

  doc.save(`KhataFlow-Money-Custody-Report.pdf`);
};
