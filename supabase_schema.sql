-- Create enum type for plan
CREATE TYPE plan AS ENUM ('free', 'pro', 'free_trial_over');

-- Create tables
CREATE TABLE organization (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    image_url TEXT,
    allowed_responses_count INTEGER,
    plan plan
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email TEXT,
    organization_id TEXT REFERENCES organization(id)
);

CREATE TABLE interviewer (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    agent_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    audio TEXT,
    empathy INTEGER NOT NULL,
    exploration INTEGER NOT NULL,
    rapport INTEGER NOT NULL,
    speed INTEGER NOT NULL
);

CREATE TABLE interview (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    description TEXT,
    objective TEXT,
    organization_id TEXT REFERENCES organization(id),
    user_id TEXT REFERENCES "user"(id),
    interviewer_id INTEGER REFERENCES interviewer(id),
    is_active BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    logo_url TEXT,
    theme_color TEXT,
    url TEXT,
    readable_slug TEXT,
    questions JSONB,
    quotes JSONB[],
    insights TEXT[],
    respondents TEXT[],
    question_count INTEGER,
    response_count INTEGER,
    time_duration TEXT
);

CREATE TABLE response (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    name TEXT,
    email TEXT,
    call_id TEXT,
    candidate_status TEXT,
    duration INTEGER,
    details JSONB,
    analytics JSONB,
    is_analysed BOOLEAN DEFAULT false,
    is_ended BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    tab_switch_count INTEGER
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    email TEXT,
    feedback TEXT,
    satisfaction INTEGER
);

-- Job Posts and ATS System Tables
CREATE TABLE job_post (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    user_id TEXT NOT NULL REFERENCES "user"(id),
    organization_id TEXT NOT NULL REFERENCES organization(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB,
    responsibilities JSONB,
    location TEXT,
    employment_type TEXT,
    salary_range TEXT,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    interview_id TEXT REFERENCES interview(id),
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    readable_slug TEXT UNIQUE NOT NULL
);

CREATE TABLE job_application (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_post_id TEXT NOT NULL REFERENCES job_post(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    cv_text TEXT NOT NULL,
    ats_score NUMERIC DEFAULT 0,
    ats_analysis JSONB,
    status TEXT DEFAULT 'submitted',
    shortlist_date TIMESTAMP WITH TIME ZONE,
    is_shortlisted BOOLEAN DEFAULT false,
    cover_letter TEXT,
    linkedin_url TEXT
);

CREATE TABLE job_application_email_sent (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_application_id TEXT NOT NULL REFERENCES job_application(id) ON DELETE CASCADE,
    email_type TEXT,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Initial Calls System Tables
CREATE TABLE initial_call_agent (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    organization_id TEXT REFERENCES organization(id),
    name TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE initial_call (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_post_id TEXT NOT NULL REFERENCES job_post(id) ON DELETE CASCADE,
    job_application_id TEXT NOT NULL REFERENCES job_application(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    organization_id TEXT NOT NULL REFERENCES organization(id),
    agent_id INTEGER REFERENCES initial_call_agent(id),
    agent_name TEXT,
    call_id TEXT,
    status TEXT DEFAULT 'pending',
    duration INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    call_transcript TEXT,
    summary_report JSONB,
    candidate_responses JSONB,
    is_analysed BOOLEAN DEFAULT false,
    is_ended BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    notes TEXT
);

CREATE TABLE initial_call_config (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_post_id TEXT NOT NULL REFERENCES job_post(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    organization_id TEXT NOT NULL REFERENCES organization(id),
    agent_id INTEGER REFERENCES initial_call_agent(id),
    agent_name TEXT,
    greeting_text TEXT,
    organization_name TEXT,
    job_title TEXT,
    call_script JSONB,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_job_post_organization_id ON job_post(organization_id);
CREATE INDEX idx_job_post_user_id ON job_post(user_id);
CREATE INDEX idx_job_post_readable_slug ON job_post(readable_slug);
CREATE INDEX idx_job_application_job_post_id ON job_application(job_post_id);
CREATE INDEX idx_job_application_email ON job_application(candidate_email);
CREATE INDEX idx_job_application_status ON job_application(status);
CREATE INDEX idx_initial_call_job_post_id ON initial_call(job_post_id);
CREATE INDEX idx_initial_call_job_application_id ON initial_call(job_application_id);
CREATE INDEX idx_initial_call_organization_id ON initial_call(organization_id);
CREATE INDEX idx_initial_call_status ON initial_call(status);
CREATE INDEX idx_initial_call_config_job_post_id ON initial_call_config(job_post_id);
CREATE INDEX idx_initial_call_config_organization_id ON initial_call_config(organization_id);
