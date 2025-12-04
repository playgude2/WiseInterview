import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from("interview")
      .select(`*, organization(name)`)
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    // Map organization data to organization_name field
    const interviewsWithOrgName = (clientData || []).map((interview: any) => ({
      ...interview,
      organization_name: interview.organization?.name || null,
    }));

    return interviewsWithOrgName;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const slugify = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const normalizedId = slugify(id);

    // Fetch all interviews (handles both ID and slug-based lookups)
    const { data: allData, error: fetchError } = await supabase
      .from("interview")
      .select(`*, organization(name)`)
      .limit(1000);

    if (fetchError || !allData) {
      console.log("Error fetching interviews:", fetchError);

      return null;
    }

    // First try exact ID match
    const exactMatch = allData.find((interview: any) => interview.id === id);

    if (exactMatch) {
      return {
        ...exactMatch,
        organization_name: (exactMatch as any).organization?.name || null,
      };
    }

    // If not found by ID, try to match by slug (with normalization)
    const slugMatch = allData.find(
      (interview: any) =>
        slugify(interview.readable_slug || "") === normalizedId
    );

    if (slugMatch) {
      return {
        ...slugMatch,
        organization_name: (slugMatch as any).organization?.name || null,
      };
    }

    return null;
  } catch (error) {
    console.log("Error in getInterviewById:", error);

    return null;
  }
};

const updateInterview = async (payload: any, id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`respondents`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterview = async (payload: any) => {
  const { error, data } = await supabase
    .from("interview")
    .insert({ ...payload });
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    const { error } = await supabase
      .from("interview")
      .update({ is_active: false })
      .eq("organization_id", organizationId)
      .eq("is_active", true); // Optional: only update if currently active

    if (error) {
      console.error("Failed to deactivate interviews:", error);
    }
  } catch (error) {
    console.error("Unexpected error disabling interviews:", error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};
