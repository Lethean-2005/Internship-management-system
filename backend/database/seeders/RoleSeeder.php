<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'System administrator with full access',
            ],
            [
                'name' => 'Tutor',
                'slug' => 'tutor',
                'description' => 'Academic tutor who oversees intern progress and grades reports',
            ],
            [
                'name' => 'Supervisor',
                'slug' => 'supervisor',
                'description' => 'Company supervisor who reviews worklogs and manages interns on-site',
            ],
            [
                'name' => 'Intern',
                'slug' => 'intern',
                'description' => 'Intern user who submits worklogs, reports, and slides',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
