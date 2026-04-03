<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\CompanyInterview;
use App\Models\FinalReport;
use App\Models\FinalSlide;
use App\Models\Internship;
use App\Models\InternshipApplication;
use App\Models\Role;
use App\Models\SupervisorContact;
use App\Models\User;
use App\Models\WeeklyWorklog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();
        $tutorRole = Role::where('slug', 'tutor')->first();
        $supervisorRole = Role::where('slug', 'supervisor')->first();
        $internRole = Role::where('slug', 'intern')->first();

        // Create demo users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@ims.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'department' => 'Administration',
            'is_active' => true,
        ]);

        $tutor = User::create([
            'name' => 'Tutor User',
            'email' => 'tutor@ims.com',
            'password' => Hash::make('password'),
            'role_id' => $tutorRole->id,
            'department' => 'Computer Science',
            'is_active' => true,
        ]);

        $supervisor = User::create([
            'name' => 'Supervisor User',
            'email' => 'supervisor@ims.com',
            'password' => Hash::make('password'),
            'role_id' => $supervisorRole->id,
            'department' => 'Engineering',
            'is_active' => true,
        ]);

        $intern = User::create([
            'name' => 'Intern User',
            'email' => 'intern@ims.com',
            'password' => Hash::make('password'),
            'role_id' => $internRole->id,
            'department' => 'Engineering',
            'is_active' => true,
        ]);

        // Create companies
        $company1 = Company::create([
            'name' => 'Tech Solutions Inc.',
            'address' => '123 Innovation Drive, Silicon Valley, CA',
            'phone' => '+1-555-0100',
            'email' => 'hr@techsolutions.com',
            'website' => 'https://techsolutions.com',
            'industry' => 'Technology',
            'description' => 'A leading technology company specializing in software development and cloud solutions.',
            'contact_person' => 'Jane Smith',
            'contact_phone' => '+1-555-0101',
            'is_active' => true,
        ]);

        $company2 = Company::create([
            'name' => 'Green Energy Corp.',
            'address' => '456 Sustainability Blvd, Portland, OR',
            'phone' => '+1-555-0200',
            'email' => 'careers@greenenergy.com',
            'website' => 'https://greenenergy.com',
            'industry' => 'Energy',
            'description' => 'Renewable energy company focused on solar and wind power solutions.',
            'contact_person' => 'Robert Johnson',
            'contact_phone' => '+1-555-0201',
            'is_active' => true,
        ]);

        // Create internships for company 1
        $internship1 = Internship::create([
            'company_id' => $company1->id,
            'title' => 'Software Engineering Intern',
            'description' => 'Work on real-world software projects using modern technologies including Laravel, Vue.js, and cloud services.',
            'department' => 'Engineering',
            'start_date' => '2026-05-01',
            'end_date' => '2026-08-31',
            'positions' => 3,
            'status' => 'open',
            'requirements' => 'Currently pursuing a degree in Computer Science or related field. Experience with PHP or JavaScript is preferred.',
            'created_by' => $admin->id,
        ]);

        $internship2 = Internship::create([
            'company_id' => $company1->id,
            'title' => 'Data Analyst Intern',
            'description' => 'Assist in analyzing business data, creating dashboards, and generating insights for decision making.',
            'department' => 'Analytics',
            'start_date' => '2026-06-01',
            'end_date' => '2026-09-30',
            'positions' => 2,
            'status' => 'open',
            'requirements' => 'Strong analytical skills. Experience with SQL and Python preferred.',
            'created_by' => $admin->id,
        ]);

        // Create internships for company 2
        $internship3 = Internship::create([
            'company_id' => $company2->id,
            'title' => 'Environmental Engineering Intern',
            'description' => 'Support environmental impact assessments and sustainability projects.',
            'department' => 'Engineering',
            'start_date' => '2026-05-15',
            'end_date' => '2026-08-15',
            'positions' => 2,
            'status' => 'in_progress',
            'requirements' => 'Pursuing a degree in Environmental Engineering or related field.',
            'created_by' => $supervisor->id,
        ]);

        $internship4 = Internship::create([
            'company_id' => $company2->id,
            'title' => 'Marketing Intern',
            'description' => 'Help develop marketing campaigns for renewable energy products.',
            'department' => 'Marketing',
            'start_date' => '2026-07-01',
            'end_date' => '2026-10-31',
            'positions' => 1,
            'status' => 'open',
            'requirements' => 'Pursuing a degree in Marketing or Communications.',
            'created_by' => $admin->id,
        ]);

        // Create application for intern
        InternshipApplication::create([
            'internship_id' => $internship1->id,
            'user_id' => $intern->id,
            'status' => 'accepted',
            'applied_at' => now()->subDays(30),
            'reviewed_by' => $supervisor->id,
            'reviewed_at' => now()->subDays(25),
            'notes' => 'Strong candidate with excellent coding skills.',
        ]);

        // Create sample worklogs
        WeeklyWorklog::create([
            'user_id' => $intern->id,
            'internship_id' => $internship1->id,
            'week_number' => 1,
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-07',
            'tasks_completed' => 'Completed onboarding process. Set up development environment. Reviewed project documentation and codebase structure.',
            'challenges' => 'Needed help configuring the local Docker environment.',
            'plans_next_week' => 'Start working on the user authentication module.',
            'hours_worked' => 40.0,
            'status' => 'approved',
            'submitted_at' => now()->subDays(20),
            'reviewed_by' => $supervisor->id,
            'reviewed_at' => now()->subDays(18),
            'feedback' => 'Great start! Good initiative on reviewing the documentation.',
        ]);

        WeeklyWorklog::create([
            'user_id' => $intern->id,
            'internship_id' => $internship1->id,
            'week_number' => 2,
            'start_date' => '2026-05-08',
            'end_date' => '2026-05-14',
            'tasks_completed' => 'Implemented user registration and login endpoints. Wrote unit tests for authentication flow.',
            'challenges' => 'Had some difficulty with token refresh logic.',
            'plans_next_week' => 'Implement role-based access control.',
            'hours_worked' => 38.5,
            'status' => 'submitted',
            'submitted_at' => now()->subDays(10),
        ]);

        WeeklyWorklog::create([
            'user_id' => $intern->id,
            'internship_id' => $internship1->id,
            'week_number' => 3,
            'start_date' => '2026-05-15',
            'end_date' => '2026-05-21',
            'tasks_completed' => 'Working on RBAC implementation and middleware.',
            'challenges' => null,
            'plans_next_week' => null,
            'hours_worked' => 20.0,
            'status' => 'draft',
        ]);

        // Create a final report
        FinalReport::create([
            'user_id' => $intern->id,
            'internship_id' => $internship1->id,
            'title' => 'Internship Final Report - Software Engineering',
            'content' => 'During my internship at Tech Solutions Inc., I worked on the authentication module of the main platform. Key achievements include implementing a secure token-based auth system and role-based access control.',
            'status' => 'draft',
        ]);

        // Create a final slide
        FinalSlide::create([
            'user_id' => $intern->id,
            'internship_id' => $internship1->id,
            'title' => 'Internship Presentation - Authentication System',
            'description' => 'Final presentation covering the authentication system implementation during the internship period.',
            'presentation_date' => '2026-08-25',
            'status' => 'draft',
        ]);

        // Create an interview
        CompanyInterview::create([
            'user_id' => $intern->id,
            'company_id' => $company1->id,
            'internship_id' => $internship1->id,
            'interview_date' => '2026-04-15 10:00:00',
            'location' => 'Tech Solutions HQ, Room 201',
            'type' => 'onsite',
            'status' => 'scheduled',
            'notes' => 'Technical interview focusing on PHP and JavaScript.',
        ]);

        // Create a contact message
        SupervisorContact::create([
            'user_id' => $intern->id,
            'supervisor_id' => $supervisor->id,
            'internship_id' => $internship1->id,
            'subject' => 'Question about project requirements',
            'message' => 'Hi, I have a question about the authentication module requirements. Should we support OAuth2 social login or just email/password?',
            'reply' => 'For now, focus on email/password authentication. We can add OAuth2 in a future sprint.',
            'replied_at' => now()->subDays(15),
            'is_read' => true,
        ]);
    }
}
