<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            // General
            'settings.app_name' => ['sometimes', 'string', 'max:255'],
            'settings.app_description' => ['sometimes', 'string', 'max:500'],
            'settings.app_timezone' => ['sometimes', 'string', 'max:100'],
            'settings.contact_email' => ['sometimes', 'email', 'max:255'],
            'settings.default_language' => ['sometimes', 'string', 'in:en,km,fr,mg,vi'],
            'settings.academic_year' => ['sometimes', 'string', 'max:20'],
            'settings.semester' => ['sometimes', 'string', 'in:fall,spring,summer,full_year'],
            // Internship
            'settings.max_interns_per_tutor' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'settings.internship_min_duration_weeks' => ['sometimes', 'integer', 'min:1', 'max:52'],
            'settings.internship_max_duration_weeks' => ['sometimes', 'integer', 'min:1', 'max:104'],
            'settings.max_leave_days_per_intern' => ['sometimes', 'integer', 'min:0', 'max:60'],
            'settings.worklog_submission_day' => ['sometimes', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            // Approvals
            'settings.require_worklog_approval' => ['sometimes', 'boolean'],
            'settings.require_report_approval' => ['sometimes', 'boolean'],
            'settings.require_slide_approval' => ['sometimes', 'boolean'],
            // File uploads
            'settings.max_file_upload_mb' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'settings.allowed_report_formats' => ['sometimes', 'string', 'max:100'],
            'settings.allowed_slide_formats' => ['sometimes', 'string', 'max:100'],
            // Notifications
            'settings.notify_tutor_on_submission' => ['sometimes', 'boolean'],
            'settings.notify_intern_on_review' => ['sometimes', 'boolean'],
            'settings.notify_admin_on_registration' => ['sometimes', 'boolean'],
            // Security & Access
            'settings.maintenance_mode' => ['sometimes', 'boolean'],
            'settings.allow_registration' => ['sometimes', 'boolean'],
            'settings.session_lifetime_minutes' => ['sometimes', 'integer', 'min:5', 'max:1440'],
            'settings.password_min_length' => ['sometimes', 'integer', 'min:6', 'max:32'],
            'settings.require_email_verification' => ['sometimes', 'boolean'],
        ]);

        foreach ($request->input('settings') as $key => $value) {
            Setting::setValue($key, (string) $value);
        }

        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data' => $settings,
        ]);
    }
}
