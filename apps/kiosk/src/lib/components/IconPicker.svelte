<script lang="ts">
  import Field from "$lib/components/Form/Field.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { clickOutside } from "$lib/utilities";
  import { createEventDispatcher } from "svelte";

  export let open: boolean             = false;
  export let value: string | undefined = undefined;

  // Holds the current filter term
  let filter: string = "";

  const dispatch = createEventDispatcher<{ change: { value: string } }>();

  let iconGroups: { name: string, icons: string[] }[] = [
    {
      name: "Suggested",
      icons: [
        "home",
        "star",
        "favorite",
        "bolt",
        "swords",
        "science",
        "construction"
      ]
    },
    {
      name: "Sports & Activities",
      icons: [
        "school",
        "campaign",
        "construction",
        "engineering",
        "volunteer_activism",
        "science",
        "sports_esports",
        "cake",
        "self_improvement",
        "sports_soccer",
        "air",
        "biotech",
        "water",
        "hiking",
        "architecture",
        "personal_injury",
        "sports_basketball",
        "sports_tennis",
        "nights_stay",
        "sports_gymnastics",
        "backpack",
        "surfing",
        "piano",
        "sports",
        "toys",
        "sports_volleyball",
        "sports_baseball",
        "camping",
        "downhill_skiing",
        "kayaking",
        "swords",
        "phishing",
        "sports_football",
        "skateboarding",
        "sports_golf",
        "sports_cricket",
        "roller_skating",
        "scuba_diving",
        "paragliding",
        "snowboarding",
        "sports_hockey",
        "ice_skating"
      ]
    },
    {
      name: "Business",
      icons: [
        "shopping_cart",
        "payments",
        "shopping_bag",
        "monitoring",
        "storefront",
        "sell",
        "account_balance",
        "work",
        "paid",
        "savings",
        "calculate",
        "account_tree",
        "domain",
        "precision_manufacturing", // tech
        "forklift", // tech
        "front_loader", // tech
        "trolley", // tech
        "currency_rupee",
        "euro",
        "currency_ruble",
        "currency_yuan",
        "currency_lira",
        "currency_pound",
        "currency_bitcoin",
        "pie_chart",
        "barcode_scanner",
        "copyright",
        "conversion_path",
        "track_changes",
        "tenancy",
        "family_history",
        "data_exploration",
        "bubble_chart",
        "mediation"
      ]
    },
    {
      name: "Food & Travel",
      icons: [
        "apartment",
        "fitness_center",
        "lunch_dining",
        "spa",
        "cottage",
        "local_cafe",
        "hotel",
        "family_restroom",
        "beach_access",
        "local_bar",
        "pool",
        "luggage",
        "casino",
        "sports_bar",
        "bakery_dining",
        "ramen_dining",
        "nightlife",
        "local_dining",
        "icecream",
        "dinner_dining",
        "festival",
        "attractions",
        "golf_course",
        "smoking_rooms",
        "brunch_dining",
        "houseboat",
        "tapas",
        "child_friendly"
      ]
    },
    {
      name: "Transportation",
      icons: [
        "local_shipping",
        "flight",
        "directions_run",
        "directions_bus",
        "directions_bike",
        "directions_boat",
        "train",
        "two_wheeler",
        "agriculture",
        "sailing",
        "electric_car",
        "commute",
        "subway",
        "electric_scooter",
        "airlines",
        "u_turn_right",
        "fork_left",
        "snowmobile"
      ]
    },
    {
      name: "Home",
      icons: [
        "laundry",
        "tools_power_drill",
        "ev_charger",
        "home_storage",
        "nest_multi_room",
        "nest_secure_alarm",
        "light_group",
        "self_care",
        "phone_iphone",
        "save",
        "smartphone",
        "print",
        "computer",
        "devices",
        "desktop_windows",
        "smart_display",
        "dns",
        "memory",
        "headphones",
        "smart_toy",
        "route",
        "point_of_sale"
      ]
    },
    {
      name: "People",
      icons: [
        "person",
        "group",
        "share",
        "thumb_up",
        "groups",
        "public",
        "handshake",
        "support_agent",
        "face",
        "sentiment_satisfied",
        "rocket_launch",
        "workspace_premium",
        "psychology",
        "water_drop",
        "emoji_objects",
        "diversity_3",
        "eco",
        "pets",
        "travel_explore",
        "mood",
        "sunny",
        "quiz",
        "health_and_safety",
        "sentiment_dissatisfied",
        "sentiment_very_satisfied",
        "military_tech",
        "recycling",
        "thumb_down",
        "gavel",
        "diamond",
        "monitor_heart",
        "emoji_people",
        "diversity_1",
        "workspaces",
        "vaccines",
        "compost",
        "forest",
        "waving_hand",
        "group_work",
        "sentiment_very_dissatisfied",
        "sentiment_neutral",
        "diversity_2",
        "front_hand",
        "cruelty_free",
        "man",
        "medical_information",
        "coronavirus",
        "psychology_alt",
        "rocket",
        "female",
        "potted_plant",
        "emoji_nature",
        "rainy",
        "woman",
        "connect_without_contact",
        "cookie",
        "male",
        "mood_bad",
        "bedtime",
        "solar_power",
        "thunderstorm",
        "communication",
        "partly_cloudy_day",
        "cloudy",
        "thumbs_up_down",
        "masks",
        "emoji_flags",
        "hive",
        "heart_broken",
        "sentiment_extremely_dissatisfied",
        "clear_day",
        "boy",
        "whatshot",
        "emoji_food_beverage",
        "emoji_transportation",
        "wind_power",
        "elderly",
        "face_6",
        "reduce_capacity",
        "sick",
        "pregnant_woman",
        "bloodtype",
        "face_3",
        "medication_liquid",
        "egg",
        "co2",
        "weight",
        "follow_the_signs",
        "skull",
        "face_4",
        "oil_barrel",
        "transgender",
        "elderly_woman",
        "clean_hands",
        "sanitizer",
        "person_2",
        "bring_your_own_ip",
        "cloudy_filled",
        "public_off",
        "social_distance",
        "sign_language",
        "face_2",
        "south_america",
        "routine",
        "sunny_snowing",
        "emoji_symbols",
        "garden_cart",
        "flood",
        "egg_alt",
        "face_5",
        "cyclone",
        "girl",
        "person_4",
        "dentistry",
        "tsunami",
        "group_off",
        "outdoor_garden",
        "partly_cloudy_night",
        "severe_cold",
        "snowing",
        "person_3",
        "tornado",
        "landslide",
        "vaping_rooms",
        "safety_divider",
        "foggy",
        "no_adult_content",
        "volcano",
        "18_up_rating",
        "blind",
        "6_ft_apart",
        "vape_free",
        "not_accessible",
        "radiology",
        "rib_cage",
        "hand_bones",
        "bedtime_off",
        "rheumatology",
        "orthopedics",
        "tibia",
        "skeleton",
        "humerus",
        "agender",
        "femur",
        "tibia_alt",
        "femur_alt",
        "foot_bones",
        "humerus_alt",
        "ulna_radius",
        "ulna_radius_alt",
        "specific_gravity",
        "breastfeeding",
        "footprint",
        "labs",
        "cognition",
        "nutrition",
        "stethoscope",
        "altitude",
        "psychiatry",
        "dew_point",
        "vital_signs",
        "prayer_times",
        "ent",
        "home_health",
        "lab_research",
        "allergies",
        "barefoot",
        "conditions",
        "humidity_percentage",
        "pediatrics",
        "lab_panel",
        "medical_mask",
        "nephrology",
        "oncology",
        "water_ph",
        "body_fat",
        "dermatology",
        "fluid_balance",
        "fluid_med",
        "gastroenterology",
        "genetics",
        "glucose",
        "hematology",
        "immunology",
        "infrared",
        "microbiology",
        "mixture_med",
        "ophthalmology",
        "oral_disease",
        "pulmonology",
        "syringe",
        "urology",
        "wounds_injuries"
      ]
    },
    {
      name: "Miscellaneous",
      icons: [
        "info",
        "visibility",
        "schedule",
        "help",
        "language",
        "lock",
        "warning",
        "error",
        "visibility_off",
        "verified",
        "task_alt",
        "history",
        "event",
        "bookmark",
        "calendar_today",
        "tips_and_updates",
        "question_mark",
        "fingerprint",
        "lightbulb",
        "category",
        "update",
        "lock_open",
        "priority_high",
        "code",
        "build",
        "date_range",
        "settings_suggest",
        "touch_app",
        "stars",
        "new_releases",
        "account_box",
        "celebration",
        "bug_report",
        "push_pin",
        "alarm",
        "extension",
        "hourglass_empty",
        "support",
        "bookmarks",
        "accessibility_new",
        "pan_tool_alt",
        "supervised_user_circle",
        "collections_bookmark",
        "interests",
        "dangerous",
        "all_inclusive",
        "rule",
        "change_history",
        "priority",
        "build_circle",
        "wysiwyg",
        "pan_tool",
        "circle_notifications",
        "hotel_class",
        "api",
        "manage_history",
        "accessible",
        "anchor"
      ]
    }
  ];
  $: filterTerm = filter.toLowerCase().replace( /\/s+/, "_" );
  $: filteredGroups = filterTerm
                      ? iconGroups
                      .map( ( { name, icons } ) => ( {
                        icons: name.toLowerCase().startsWith( filterTerm )
                               ? icons
                               : icons.filter( icon => icon.includes( filterTerm ) ),
                        name
                      } ) )
                      .filter( ( { icons } ) => icons.length > 0 )
                      : iconGroups;

  function updateSelection( icon: string ) {
    return () => {
      value  = icon;
      open   = false;
      filter = "";
      dispatch( "change", { value } );
    };
  }

  function handleEscape( event: KeyboardEvent ) {
    if ( event.key === "Escape" ) {
      open   = false;
      filter = "";
    }
  }
</script>

<svelte:window on:keyup={handleEscape} />

<div class="relative">
  <div class="contents cursor-pointer" on:click={() => open = true}>
    <slot name="activator" {open}></slot>
  </div>

  {#if open}
    <article class="absolute top-full left-0 mt-2" use:clickOutside on:click_outside={() => open = false}>
      <div class="chevron"></div>

      <div class="bg-white dark:bg-black rounded-lg border dark:border-gray-800 shadow-xl w-96 max-h-80 overflow-y-auto">
        <header class="p-2">
          <Field type="search" bind:value={filter} placeholder="Filter icons…" appendIcon="filter_list" autofocus />
        </header>

        <div class="space-y-8">
          {#each filteredGroups as group}
            <section class="">
              <header class="sticky top-0 bg-white dark:bg-black px-6 py-2 mb-2 border-b border-gray-200 dark:border-gray-800">
                <h4 class="font-bold">{group.name}</h4>
              </header>
              <div class="grid grid-cols-6 px-2 pb-2">
                {#each group.icons as icon}
                  <button class="icon-button" class:active={value === icon}
                          on:click={updateSelection(icon)}>
                    <Icon name={icon} class="leading-none" />
                  </button>
                {/each}
              </div>
            </section>
          {/each}

          {#if filteredGroups.length === 0}
            <section class="p-4">
              <span class="text-gray-500">No results found.</span>
            </section>
          {/if}
        </div>
      </div>
    </article>
  {/if}
</div>

<style lang="postcss">
    .chevron {
        @apply relative ml-5 w-4 border-solid border-b-gray-200 dark:border-b-gray-800 border-b-8 border-x-transparent border-x-8 border-t-0 after:block after:content-[attr(none)] after:absolute after:top-0.5 after:-left-2 after:w-4 after:border-solid after:border-b-white after:dark:border-b-black after:border-b-8 after:border-x-transparent after:border-x-8 after:border-t-0;
    }

    .icon-button {
        @apply pt-3 pb-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900;

        &.active {
            @apply text-blue-500;
        }
    }
</style>
