// Mock Data for Operations Module
// Realistic pest control technician and job data for development and testing

// ============================================================================
// TECHNICIAN DATA
// ============================================================================

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'operations_manager' | 'technician' | 'lead_technician';
  status: 'active' | 'on_leave' | 'inactive';
  hireDate: string;
  certifications: string[];
  vehicleId?: string;
  territory?: string;
  avatarUrl?: string;
}

export interface ServiceJob {
  id: string;
  technicianId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  status: 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  notes?: string;
  pestTypes?: string[];
  productsUsed?: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
  completionNotes?: string;
  customerSignature?: boolean;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianPerformance {
  technician: Technician;
  jobsCompleted: number;
  jobsScheduled: number;
  avgJobDuration: number; // minutes
  avgRating: number;
  onTimeRate: number; // percentage
  completionRate: number; // percentage
  productsUsed: number;
  milesdriven: number;
  callbackRate: number; // percentage (lower is better)
  revenue: number; // cents
}

// Operations team members
export const operationsTeam: Technician[] = [
  {
    id: 'ops-manager',
    firstName: 'Tom',
    lastName: 'Wilson',
    email: 'tom.wilson@pestcontrol.com',
    phone: '(713) 555-0200',
    role: 'operations_manager',
    status: 'active',
    hireDate: '2019-05-10',
    certifications: ['QualityPro', 'State Pesticide License', 'Management Certification'],
    territory: 'Houston Metro',
  },
  {
    id: 'tech-1',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@pestcontrol.com',
    phone: '(713) 555-0201',
    role: 'lead_technician',
    status: 'active',
    hireDate: '2020-08-15',
    certifications: ['State Pesticide License', 'Termite Specialist', 'Wildlife Control'],
    vehicleId: 'V-101',
    territory: 'Downtown Houston',
  },
  {
    id: 'tech-2',
    firstName: 'Robert',
    lastName: 'Garcia',
    email: 'robert.garcia@pestcontrol.com',
    phone: '(281) 555-0202',
    role: 'technician',
    status: 'active',
    hireDate: '2021-03-22',
    certifications: ['State Pesticide License', 'General Pest Control'],
    vehicleId: 'V-102',
    territory: 'Sugar Land / Missouri City',
  },
  {
    id: 'tech-3',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david.lee@pestcontrol.com',
    phone: '(832) 555-0203',
    role: 'technician',
    status: 'active',
    hireDate: '2022-01-10',
    certifications: ['State Pesticide License', 'Rodent Control Specialist'],
    vehicleId: 'V-103',
    territory: 'The Woodlands / Spring',
  },
  {
    id: 'tech-4',
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.martinez@pestcontrol.com',
    phone: '(346) 555-0204',
    role: 'technician',
    status: 'active',
    hireDate: '2022-06-15',
    certifications: ['State Pesticide License', 'Bed Bug Specialist'],
    vehicleId: 'V-104',
    territory: 'Katy / Cypress',
  },
  {
    id: 'tech-5',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@pestcontrol.com',
    phone: '(713) 555-0205',
    role: 'technician',
    status: 'active',
    hireDate: '2023-02-01',
    certifications: ['State Pesticide License'],
    vehicleId: 'V-105',
    territory: 'Pearland / Clear Lake',
  },
  {
    id: 'tech-6',
    firstName: 'Kevin',
    lastName: 'Taylor',
    email: 'kevin.taylor@pestcontrol.com',
    phone: '(281) 555-0206',
    role: 'technician',
    status: 'on_leave',
    hireDate: '2021-09-01',
    certifications: ['State Pesticide License', 'Mosquito Control'],
    vehicleId: 'V-106',
    territory: 'Humble / Kingwood',
  },
];

// Helper functions
const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateTime = (startHour: number, endHour: number): string => {
  const hour = randomInt(startHour, endHour);
  const minute = randomItem(['00', '15', '30', '45']);
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${ampm}`;
};

// Customer names for mock jobs
const customerNames = [
  'Anderson Family', 'Smith Residence', 'Johnson Corp', 'Williams Office',
  'Brown Property', 'Davis Home', 'Miller Apartment', 'Wilson Estate',
  'Moore Business Center', 'Taylor Plaza', 'Thompson Ranch', 'Garcia Restaurant',
  'Martinez Warehouse', 'Robinson Complex', 'Clark Building', 'Lewis Dental',
  'Walker Medical', 'Hall Retail', 'Allen Office Park', 'Young Tower',
];

const streetNames = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Willow', 'Birch', 'Magnolia',
  'Hickory', 'Cypress', 'Palm', 'Peach', 'Cherry', 'Dogwood', 'Sycamore'
];

const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Ct', 'Way', 'Rd'];

const cities = [
  { name: 'Houston', state: 'TX', zip: '770' },
  { name: 'Sugar Land', state: 'TX', zip: '774' },
  { name: 'The Woodlands', state: 'TX', zip: '773' },
  { name: 'Katy', state: 'TX', zip: '774' },
  { name: 'Pearland', state: 'TX', zip: '775' },
];

const serviceTypes = [
  'General Pest Control',
  'Termite Inspection',
  'Rodent Control',
  'Mosquito Treatment',
  'Bed Bug Treatment',
  'Ant Control',
  'Roach Treatment',
  'Quarterly Maintenance',
  'Initial Service',
  'Follow-up Visit',
];

const pestTypes = [
  ['ants', 'roaches'],
  ['termites'],
  ['mice', 'rats'],
  ['mosquitoes'],
  ['bed bugs'],
  ['ants'],
  ['roaches', 'ants', 'spiders'],
  ['general pests'],
];

const products = [
  { id: 'p-1', name: 'Termidor SC', unit: 'oz' },
  { id: 'p-2', name: 'Demand CS', unit: 'oz' },
  { id: 'p-3', name: 'Advion Gel', unit: 'tubes' },
  { id: 'p-4', name: 'Phantom', unit: 'oz' },
  { id: 'p-5', name: 'Alpine WSG', unit: 'packets' },
  { id: 'p-6', name: 'Tempo SC', unit: 'oz' },
  { id: 'p-7', name: 'Suspend SC', unit: 'oz' },
];

// Generate address
const generateAddress = () => {
  const city = randomItem(cities);
  return {
    line1: `${randomInt(100, 9999)} ${randomItem(streetNames)} ${randomItem(streetTypes)}`,
    city: city.name,
    state: city.state,
    postalCode: `${city.zip}${randomInt(10, 99)}`,
  };
};

// Generate jobs for a technician
export const generateTechnicianJobs = (technicianId: string, date: Date): ServiceJob[] => {
  const jobs: ServiceJob[] = [];
  const numJobs = randomInt(5, 9); // 5-9 jobs per day
  const startHours = [8, 9, 10, 11, 13, 14, 15, 16];
  
  for (let i = 0; i < numJobs; i++) {
    const serviceType = randomItem(serviceTypes);
    const estimatedDuration = serviceType.includes('Termite') ? randomInt(60, 120) :
      serviceType.includes('Bed Bug') ? randomInt(90, 180) :
      randomInt(30, 60);
    
    // Determine status based on time
    const now = new Date();
    const jobHour = startHours[i] || 8 + i;
    let status: ServiceJob['status'];
    
    if (date.toDateString() !== now.toDateString()) {
      // Past or future dates
      status = date < now ? 'completed' : 'scheduled';
    } else {
      // Today
      if (jobHour < now.getHours() - 1) {
        status = 'completed';
      } else if (jobHour === now.getHours() || jobHour === now.getHours() - 1) {
        status = randomItem(['in_progress', 'completed']);
      } else if (jobHour === now.getHours() + 1) {
        status = randomItem(['en_route', 'scheduled']);
      } else {
        status = 'scheduled';
      }
    }

    const job: ServiceJob = {
      id: `job-${technicianId}-${date.toISOString().split('T')[0]}-${i + 1}`,
      technicianId,
      customerId: `cust-${randomInt(100, 999)}`,
      customerName: randomItem(customerNames),
      customerPhone: `(${randomItem(['713', '281', '832', '346'])}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      serviceType,
      status,
      priority: randomItem(['low', 'normal', 'normal', 'normal', 'high']),
      scheduledDate: date.toISOString().split('T')[0],
      scheduledTime: generateTime(jobHour, jobHour),
      estimatedDuration,
      actualDuration: status === 'completed' ? estimatedDuration + randomInt(-15, 20) : undefined,
      address: generateAddress(),
      notes: Math.random() > 0.7 ? 'Customer has pets - use pet-safe products' : undefined,
      pestTypes: randomItem(pestTypes),
      productsUsed: status === 'completed' ? [
        {
          productId: randomItem(products).id,
          productName: randomItem(products).name,
          quantity: randomInt(2, 8),
          unit: 'oz',
        },
      ] : undefined,
      completionNotes: status === 'completed' ? 
        'Service completed successfully. Treated all problem areas. Recommended follow-up in 30 days.' : undefined,
      customerSignature: status === 'completed',
      rating: status === 'completed' ? randomItem([4, 4, 4, 5, 5, 5, 5]) : undefined,
      createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.push(job);
  }

  return jobs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
};

// Get all jobs for today
export const getTodaysJobs = (): ServiceJob[] => {
  const today = new Date();
  const technicians = operationsTeam.filter(t => t.role !== 'operations_manager' && t.status === 'active');
  const allJobs: ServiceJob[] = [];
  
  technicians.forEach(tech => {
    allJobs.push(...generateTechnicianJobs(tech.id, today));
  });

  return allJobs;
};

// Get jobs for a specific technician
export const getTechnicianJobsForDate = (technicianId: string, date: Date): ServiceJob[] => {
  return generateTechnicianJobs(technicianId, date);
};

// Get technician performance data
export const generateTechnicianPerformance = (): TechnicianPerformance[] => {
  const technicians = operationsTeam.filter(t => t.role !== 'operations_manager' && t.status === 'active');
  
  return technicians.map((tech, index) => {
    const performanceMultiplier = [1.2, 1.1, 0.95, 1.0, 0.85][index] || 1;
    const jobsCompleted = Math.round(randomInt(120, 180) * performanceMultiplier);
    const jobsScheduled = jobsCompleted + randomInt(5, 15);
    
    return {
      technician: tech,
      jobsCompleted,
      jobsScheduled,
      avgJobDuration: Math.round(45 + (1 - performanceMultiplier) * 20), // Better performers are faster
      avgRating: parseFloat((4.2 + performanceMultiplier * 0.5).toFixed(1)),
      onTimeRate: Math.min(100, Math.round(85 + performanceMultiplier * 10)),
      completionRate: Math.min(100, Math.round((jobsCompleted / jobsScheduled) * 100)),
      productsUsed: Math.round(jobsCompleted * 2.5),
      milesdriven: Math.round(jobsCompleted * 12),
      callbackRate: Math.max(0, parseFloat((5 - performanceMultiplier * 3).toFixed(1))),
      revenue: jobsCompleted * randomInt(15000, 25000), // Revenue per job in cents
    };
  }).sort((a, b) => b.jobsCompleted - a.jobsCompleted);
};

// Get operations summary for manager dashboard
export const getOperationsSummary = () => {
  const performance = generateTechnicianPerformance();
  const todaysJobs = getTodaysJobs();
  
  return {
    totalTechnicians: operationsTeam.filter(t => t.role !== 'operations_manager').length,
    activeTechnicians: operationsTeam.filter(t => t.role !== 'operations_manager' && t.status === 'active').length,
    todaysJobsTotal: todaysJobs.length,
    jobsCompleted: todaysJobs.filter(j => j.status === 'completed').length,
    jobsInProgress: todaysJobs.filter(j => j.status === 'in_progress' || j.status === 'en_route').length,
    jobsScheduled: todaysJobs.filter(j => j.status === 'scheduled').length,
    avgCompletionRate: Math.round(performance.reduce((sum, p) => sum + p.completionRate, 0) / performance.length),
    avgOnTimeRate: Math.round(performance.reduce((sum, p) => sum + p.onTimeRate, 0) / performance.length),
    avgRating: parseFloat((performance.reduce((sum, p) => sum + p.avgRating, 0) / performance.length).toFixed(1)),
    totalRevenueToday: todaysJobs.filter(j => j.status === 'completed').length * 18500, // Avg revenue per job
    topPerformer: performance[0]?.technician,
  };
};

// Get current technician (for technician dashboard)
export const getCurrentTechnician = (techId?: string): Technician | undefined => {
  const id = techId || localStorage.getItem('dev_user_role');
  
  // Map dev user to technician
  const techMap: Record<string, string> = {
    'tech1': 'tech-1',
    'tech2': 'tech-2',
  };
  
  const actualId = techMap[id || ''] || 'tech-1';
  return operationsTeam.find(t => t.id === actualId);
};

