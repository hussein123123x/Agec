import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { WidgetStatCComponent, BadgeComponent, CardBodyComponent, CardHeaderComponent, CardFooterComponent } from '@coreui/angular';
import Chart from 'chart.js/auto';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  imports: [
    ReactiveFormsModule,
    WidgetStatCComponent, BadgeComponent, FormsModule,
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    WidgetStatCComponent
],
})
export class ProjectsComponent implements  OnInit {
  
  selectedProject: any = null;
  flag: boolean = false;
  searchQuery: string = '';
  statusFilter: string = '';
  showDetails: boolean = false;
  @ViewChild('progressChart', { static: false }) chartRef!: ElementRef;
  @ViewChild('phasesChart') phasesChartRef!: ElementRef;
  phasesChartInstance: any;
  chartInstance: any;



//   projects = [
//     {
//   id: 1,
//   name: 'توريد لوحات توزيع جهد متوسط لمجمع سكني',
//   owner: 'شركة المجمعات الحديثة',
//   startDate: '2025-02-10',
//   dueDate: '2025-05-20',
//   financial: {
//   projectValue: 1500000,
//   receivedAmount: 850000,
//   estimatedCost: 1200000,
//   spentCost: 700000,
//   toolsCost: 300000,
//   executedHours: 520,
//   notes: 'تم صرف دفعتين، باقي دفعة واحدة عند التسليم النهائي.'
// },
//   status: 'مكتمل',
//   progress: '100%',
//   voltageLevel: 'جهد متوسط (11 ك.ف.)',
//   location: 'فرع اكتوبر',
//   engineerInCharge: 'م. ناصر الفيفي',
//   description: 'توريد وتركيب واختبار لوحات توزيع جهد متوسط داخلية (RMU) للمجمع السكني الجديد ضمن مشروع الإسكان.',
//   products: [
//     { name: 'RMU لوحات توزيع 11 ك.ف.', inStock: true , quantityRequired: 3 },
//     { name: 'كابلات جهد متوسط 3x70mm', inStock: true , quantityRequired: 44 }
//   ],
//   phases: [
//   {
//     name: 'تصميم',
//     status: 'مكتملة',
//     notes: [{ author: 'م. ناصر', date: '2025-02-15', content: 'تم اعتماد التصميم بعد المراجعة مع الشركة المالكة.' }],
//     subPhases: [
//       {
//         name: 'تصميم مبدئي',
//         status: 'مكتملة',
//         notes: [{ author: 'م. ناصر', date: '2025-02-10', content: 'تم تسليم التصميم الأولي للعميل.' }],
//         subPhases: []
//       },
//       {
//         name: 'اعتماد الرسومات',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'توريد',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'طلب المواد',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تسليم الموقع',
//         status: 'مكتملة',
//         notes: [{ author: 'م. ناصر', date: '2025-03-05', content: 'تم تسليم المواد إلى الموقع حسب الجدول.' }],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'تركيب',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'تجهيز الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تركيب المعدات',
//         status: 'مكتملة',
//         notes: [{ author: 'م. ناصر', date: '2025-05-10', content: 'تم بدء أعمال التركيب.' }],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'اختبار',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'اختبارات الحماية',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تشغيل مبدئي',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   }
// ]
// ,
//   currentPhase: 3,
//   notes: [
//     {
//       author: 'م. ناصر الفيفي',
//       date: '2025-05-18',
//       content: 'تم إنهاء التركيب بنجاح، واختبار التشغيل أظهر نتائج ممتازة.'
//     }
//   ],
//   requirements: [
//     'مطابقة معايير الشركة السعودية للكهرباء',
//     'إرفاق تقرير اختبار المصنع',
//     'شهادة اختبار القبول بالموقع (SAT)'
//   ]
// }
// ,{
//   id: 2,
//   name: 'تحديث لوحات توزيع جهد منخفض بمصنع التغليف',
//   owner: 'شركة التغليف الحديثة',
//   startDate: '2025-04-01',
//   dueDate: '2025-07-01',
//   status: 'جاري',
//   progress: '45%',
//   voltageLevel: 'جهد منخفض (400 فولت)',
//   financial: {
//   projectValue: 1500000,
//   receivedAmount: 850000,
//   estimatedCost: 1200000,
//   spentCost: 700000,
//   toolsCost: 300000,
//   executedHours: 520,
//   notes: 'تم صرف دفعتين، باقي دفعة واحدة عند التسليم النهائي.'
// },
//   location: 'فرع اكتوبر',
//   engineerInCharge: 'م. سارة العبدالله',
//   description: 'تحديث شامل للوحات التوزيع الكهربائية بالمصنع لتشمل أنظمة حماية ذكية وقياس الطاقة.',
//   products: [
//     { name: 'لوحة توزيع رئيسية 400A', inStock: true , quantityRequired: 12 },
//     { name: 'قاطع حماية ذكي', inStock: false , quantityRequired: 5 },
//     { name: 'عداد طاقة رقمية', inStock: true , quantityRequired: 2 },
//     { name: 'كابلات جهد منخفض 3x70mm', inStock: true , quantityRequired: 41 },
//     { name: 'كابلات جهد منخفض 3x50mm', inStock: true , quantityRequired: 44 },
//     { name: 'كابلات جهد منخفض 3x30mm', inStock: true , quantityRequired: 34 },
//     { name: 'كابلات جهد منخفض 3x20mm', inStock: false , quantityRequired: 23 },
//     { name: 'كابلات جهد منخفض 3x10mm', inStock: false , quantityRequired: 12 },
//   ],
//   phases: [
//   {
//     name: 'تصميم',
//     status: 'مكتملة',
//     notes: [
//       { author: 'م. سارة', date: '2025-04-05', content: 'تم الاتفاق على التصميم النهائي مع قسم الصيانة.' }
//     ],
//     subPhases: [
//       {
//         name: 'تصميم مبدئي',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: [
//           {
//             name: 'مراجعة الأحمال',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'اعتماد التوصيلات',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       },
//       {
//         name: 'اعتماد الرسومات',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: [
//           {
//             name: 'إصدار رسومات CAD',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'توقيع واعتماد العميل',
//             status: 'مكتملة',
//             notes: [{ content: "تأخير العميل في الرد", author: "م. أحمد", date: "2025-06-22" }],
//             subPhases: []
//           }
//         ]
//       }
//     ]
//   },
//   {
//     name: 'توريد',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'طلب المواد',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: [
//           {
//             name: 'إصدار أمر شراء',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'تأكيد المورد',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       },
//       {
//         name: 'تسليم الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: [
//           {
//             name: 'تحضير المستودع',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'تأكيد الكميات',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       }
//     ]
//   },
//   {
//     name: 'تركيب',
//     status: 'تحت التنفيذ',
//     notes: [
//       { author: 'م. سارة', date: '2025-06-01', content: 'بانتظار توريد القواطع الذكية.' }
//     ],
//     subPhases: [
//       {
//         name: 'تجهيز الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: [
//           {
//             name: 'تركيب القواعد',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'اختبار الأرضي',
//             status: 'مكتملة',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       },
//       {
//         name: 'تركيب المعدات',
//         status: 'تحت التنفيذ',
//         notes: [],
//         subPhases: [
//           {
//             name: 'تثبيت اللوحات',
//             status: 'تحت التنفيذ',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'توصيل الكابلات',
//             status: 'لم تبدأ',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       }
//     ]
//   },
//   {
//     name: 'اختبار',
//     status: 'متأخرة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'اختبارات الحماية',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: [
//           {
//             name: 'اختبار القواطع',
//             status: 'لم تبدأ',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'فحص العزل',
//             status: 'لم تبدأ',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       },
//       {
//         name: 'تشغيل مبدئي',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: [
//           {
//             name: 'تشغيل جزئي',
//             status: 'لم تبدأ',
//             notes: [],
//             subPhases: []
//           },
//           {
//             name: 'تشغيل نهائي',
//             status: 'لم تبدأ',
//             notes: [],
//             subPhases: []
//           }
//         ]
//       }
//     ]
//   }
// ]
// ,
//   currentPhase: 1,
//   notes: [
//     {
//       author: 'م. سارة العبدالله',
//       date: '2025-06-01',
//       content: 'بانتظار توريد القواطع الذكية لتحديث التصميم النهائي.'
//     }
//   ],
//   requirements: [
//     'موافقة قسم الصيانة على التصميم المعدل',
//     'إرفاق مواصفات القواطع الجديدة',
//     'الالتزام بجدول السلامة الصناعية'
//   ]
// }
// ,
//   {
//     id: 3,
//     name: 'توسعة محطة كهرباء جهد عالي 66 ك.ف.',
//     owner: 'هيئة الكهرباء والمياه',
//     startDate: '2025-01-01',
//     dueDate: '2025-06-15',
//     status: 'متأخر',
//     progress: '68%',
//     financial: {
//   projectValue: 1500000,
//   receivedAmount: 850000,
//   estimatedCost: 1200000,
//   spentCost: 700000,
//   toolsCost: 300000,
//   executedHours: 520,
//   notes: 'تم صرف دفعتين، باقي دفعة واحدة عند التسليم النهائي.'
// },
//     voltageLevel: 'جهد عالي (66 ك.ف.)',
//     location: 'فرع اكتوبر',
//     engineerInCharge: 'م. أحمد القحطاني',
//     description: 'توسعة محطة قائمة بإضافة خلايا جهد عالي (GIS) وزيادة سعة المحولات لتحسين قدرة التغذية الكهربائية.',
//     products: [
//       { name: 'خلية GIS - 66 ك.ف.', inStock: true , quantityRequired: 12 },
//       { name: 'محول قدرة 40MVA', inStock: false , quantityRequired: 3 },
//       { name: 'جهاز SCADA', inStock: true , quantityRequired: 7 }
//     ],
//    phases: [
//   {
//     name: 'تصميم',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'تصميم مبدئي',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'اعتماد الرسومات',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'توريد',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'طلب المواد',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تسليم الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'تركيب',
//     status: 'تحت التنفيذ',
//     notes: [
//       { author: 'م. أحمد القحطاني', date: '2025-06-01', content: 'بدأنا بتركيب خلايا GIS.' }
//     ],
//     subPhases: [
//       {
//         name: 'تجهيز الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تركيب المعدات',
//         status: 'تحت التنفيذ',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'اختبار',
//     status: 'متأخرة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'اختبارات الحماية',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تشغيل مبدئي',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   }
// ]
// ,
//     currentPhase: 2, // index of "تركيب"
//     notes: [
//       {
//         author: 'م. أحمد القحطاني',
//         date: '2025-06-10',
//         content: 'تأخر في التوريد من المصنع. تم التواصل مع المورد.'
//       },
//       {
//         author: 'م. منى السالم',
//         date: '2025-06-15',
//         content: 'يجب مراجعة إعدادات الحماية قبل بدء التشغيل.'
//       }
//     ]
//   },
//   {
//     id: 3,
//     name: 'توسعة محطة كهرباء جهد عالي 66 ك.ف.',
//     owner: 'هيئة الكهرباء والمياه',
//     startDate: '2025-01-01',
//     dueDate: '2025-07-15',
//     financial: {
//   projectValue: 1500000,
//   receivedAmount: 850000,
//   estimatedCost: 1200000,
//   spentCost: 700000,
//   toolsCost: 300000,
//   executedHours: 520,
//   notes: 'تم صرف دفعتين، باقي دفعة واحدة عند التسليم النهائي.'
// },
//     status: 'اقترب',
//     progress: '68%',
//     voltageLevel: 'جهد عالي (66 ك.ف.)',
//     location: 'فرع اكتوبر',
//     engineerInCharge: 'م. أحمد القحطاني',
//     description: 'توسعة محطة قائمة بإضافة خلايا جهد عالي (GIS) وزيادة سعة المحولات لتحسين قدرة التغذية الكهربائية.',
//     products: [
//       { name: 'خلية GIS - 66 ك.ف.', inStock: true , quantityRequired: 12 },
//       { name: 'محول قدرة 40MVA', inStock: false , quantityRequired: 3 },
//       { name: 'جهاز SCADA', inStock: true , quantityRequired: 7 }
//     ],
//    phases: [
//   {
//     name: 'تصميم',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'تصميم مبدئي',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'اعتماد الرسومات',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'توريد',
//     status: 'مكتملة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'طلب المواد',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تسليم الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'تركيب',
//     status: 'تحت التنفيذ',
//     notes: [
//       { author: 'م. أحمد القحطاني', date: '2025-06-01', content: 'بدأنا بتركيب خلايا GIS.' }
//     ],
//     subPhases: [
//       {
//         name: 'تجهيز الموقع',
//         status: 'مكتملة',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تركيب المعدات',
//         status: 'تحت التنفيذ',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   },
//   {
//     name: 'اختبار',
//     status: 'متأخرة',
//     notes: [],
//     subPhases: [
//       {
//         name: 'اختبارات الحماية',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: []
//       },
//       {
//         name: 'تشغيل مبدئي',
//         status: 'لم تبدأ',
//         notes: [],
//         subPhases: []
//       }
//     ]
//   }
// ]
// ,
//     currentPhase: 2, // index of "تركيب"
//     notes: [
//       {
//         author: 'م. أحمد القحطاني',
//         date: '2025-06-10',
//         content: 'تأخر في التوريد من المصنع. تم التواصل مع المورد.'
//       },
//       {
//         author: 'م. منى السالم',
//         date: '2025-06-15',
//         content: 'يجب مراجعة إعدادات الحماية قبل بدء التشغيل.'
//       }
//     ]
//   }
//   ];

 projects:any = []


  constructor(private projectService: ProjectService){}
    
  ngOnInit(): void {

    this.getProjects()
  }

  async getProjects() {
  const res = await this.projectService.getProjects();
  console.log("🚀 ~ ProjectsComponent ~ getProjects ~ res:", res)

  // نعمل map علشان يتناسب مع الكود الحالي
  this.projects = res.map((p: any) => ({
    id: p.projectNumber, // أو أي id مناسب
    name: p.projectName,
    owner: p.client,
    startDate: p.createdAt, // أو أي تاريخ بداية عندك
    dueDate: p.deliveryDate,
    status: p.status || 'جاري', // لو مش موجود حط افتراضي
    progress: p.progress || '0%',
    studyEngineerName: p.studyEngineerName,
    productEngineerName: p.productEngineerName,
    consultantName: p.consultantName,
    consultantPhone: p.consultantPhone,
    extraDetails: p.extraDetails,
    projectCost: p.projectCost,
    projectNumber: p.projectNumber,
    history: p.history || [],
  }));

  console.log("🚀 ~ ProjectsComponent ~ getProjects ~ mapped:", this.projects);
}
  get activeProjects() {
    return this.projects?.filter((p:any) => p.status === 'جاري').length;
  }

  get filteredProjects() {
  return this.projects.filter((project:any) => {
    const matchesStatus =
      !this.statusFilter || project.status.trim() === this.statusFilter;

    const query = this.searchQuery?.toLowerCase() || '';
    const matchesQuery =
      project.name.toLowerCase().includes(query) ||
      project.owner.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
}

getBadgeClass(status: string): string {
  switch (status) {
    case 'مكتملة': return 'bg-success';
    case 'تحت التنفيذ': return 'bg-warning text-dark';
    case 'متأخرة': return 'bg-danger';
    case 'لم تبدأ': return 'bg-secondary';
    default: return 'bg-light';
  }
}

  getRemainingDays(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0; // إذا انتهى الموعد، لا تُظهر رقم سلبي
}

getCardBorderClass(dueDate: string, status: string): string {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (status === 'مكتمل') {
    return 'border border-success'; // لو المشروع مكتمل، نجعله أخضر دائمًا
  }

  if (diffDays < 0) {
    return 'border border-danger'; // اقترب وغير مكتمل
  } else if (diffDays <= 10) {
    return 'border border-warning'; // قريب من موعده
  } else {
    return ''; // لا شيء خاص
  }
}


getDelayDays(dueDate: string, status: string): number {
  if (status === 'مكتمل') return 0;

  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}



  get completedProjects() {
    return this.projects.filter((p:any) => p.status === 'مكتمل').length || 0;
  }

  countCompletedSubPhases(subPhases: any[]): number {
    return subPhases.filter(sub => sub.status === 'مكتملة').length || 0;
  }


  get nearProjects(){
    return this.projects.filter((p:any) => p.status === 'اقترب').length || 0;
  }

  get delayedProjects() {
    return this.projects.filter((p:any) => p.status === 'متأخر').length || 0;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'جاري': return 'info';
      case 'مكتمل': return 'success';
      case 'اقترب': return 'warning';
      case 'متأخر': return 'danger';
      default: return 'secondary';
    }
  }

  closeDetails() {
  this.selectedProject = null;
  this.showDetails = false;
}

  viewProject(project: any) {
  this.selectedProject = project;
  this.showDetails = true;

  setTimeout(() => this.renderProgressChart(), 0); // لإظهار الرسم البياني بعد عرض التفاصيل
  setTimeout(() => {
  this.renderPhasesChart();
}, 0);
}

getProjectPerformance(progressStr: string, dueDate: string, startDate: string): string {
  const progress = parseInt(progressStr.replace('%', '')); // مثال: '68%' => 68
  const totalDuration = (new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
  const remainingDays = this.getRemainingDays(dueDate);
  const elapsedDays = totalDuration - remainingDays;
  const expectedProgress = Math.round((elapsedDays / totalDuration) * 100);
  const diff = progress - expectedProgress;

  if (diff <= -20) return 'متأخر جدًا';
  if (diff <= -10) return 'متأخر';
  if (diff <= 10) return 'جيد';
  if (diff <= 20) return 'جيد جدًا';
  return 'ممتاز';
}

getSpentPercentage(project: any): number {
  const spent = project?.financial?.spentCost;
  const total = project?.financial?.estimatedCost;
  return spent && total ? (spent / total) * 100 : 0;
}

getCollectionPercentage(project: any): number {
  const received = project?.financial?.receivedAmount;
  const total = project?.financial?.projectValue;
  return received && total ? (received / total) * 100 : 0;
}



  renderProgressChart() {
  if (!this.chartRef) return;
  if (this.chartInstance) this.chartInstance.destroy();

  const ctx = this.chartRef.nativeElement.getContext('2d');
  const progress = parseInt(this.selectedProject.progress.replace('%', ''));

  this.chartInstance = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['تم إنجازه', 'المتبقي'],
    datasets: [{
      data: [progress, 100 - progress],
      backgroundColor: ['#28a745', '#e0e0e0']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // حتى يتبع أبعاد الحاوية
    plugins: {
      legend: { position: 'bottom' }
    }
  }
});

}

getPhaseProgress(phase: any): number {
  if (!phase.subPhases?.length) return 0;
  const total = phase.subPhases.length;
  const completed = phase.subPhases.filter((s: any) => s.status === 'مكتملة').length;
  return Math.round((completed / total) * 100);
}

getPhaseDuration(phase: any): number {
  // مؤقتاً نحسب عدد الأيام من الملاحظات إن وُجدت
  const baseDate = new Date(this.selectedProject.startDate);
  const fakeEnd = new Date(baseDate.getTime() + Math.random() * 10 * 86400000); // عشوائي
  const diff = (fakeEnd.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
}

renderPhasesChart() {
  if (this.phasesChartInstance) {
    this.phasesChartInstance.destroy();
  }

  const ctx = this.phasesChartRef.nativeElement.getContext('2d');
  const phases = this.selectedProject.phases;

  const labels = phases.map((p:any) => p.name);
  const progressData = phases.map((p:any) => this.getPhaseProgress(p));
  const durationData = phases.map((p:any) => this.getPhaseDuration(p));

  this.phasesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'نسبة التقدم (%)',
          data: progressData,
          backgroundColor: '#0d6efd'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'القيمة'
          }
        }
      }
    }
  });
}

}


