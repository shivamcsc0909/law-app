<?php
// NyayaSetu API Gateway Router
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', '0');

require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/helpers/Validator.php';
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProfileController.php';
require_once __DIR__ . '/controllers/ProfessionalController.php';
require_once __DIR__ . '/controllers/PostController.php';
require_once __DIR__ . '/controllers/LegalHelpController.php';
require_once __DIR__ . '/controllers/JobController.php';
require_once __DIR__ . '/controllers/CaseController.php';
require_once __DIR__ . '/controllers/DocumentController.php';
require_once __DIR__ . '/controllers/MessageController.php';
require_once __DIR__ . '/controllers/SearchController.php';
require_once __DIR__ . '/controllers/AdminController.php';

// Handle CORS
CorsMiddleware::handle();

// Parse Request Path & Method
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize path: strip script name or leading /api
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptName !== '/' && str_starts_with($requestUri, $scriptName)) {
    $requestUri = substr($requestUri, strlen($scriptName));
}
$path = trim(preg_replace('#^/api#', '', $requestUri), '/');
$segments = explode('/', $path);

try {
    // Health Check / Root Endpoint
    if ($path === '' || $path === 'health') {
        Response::success('NyayaSetu India Legal Platform API is active and operational.', [
            'app' => Config::$APP_NAME,
            'version' => '1.0.0',
            'server_time' => date('c')
        ]);
    }

    // 1. AUTH ROUTES
    if ($segments[0] === 'auth') {
        $controller = new AuthController();
        if ($segments[1] === 'firebase' && $method === 'POST') {
            $controller->firebaseAuth();
        } elseif ($segments[1] === 'login' && $method === 'POST') {
            $controller->login();
        } elseif ($segments[1] === 'me' && $method === 'GET') {
            $user = AuthMiddleware::authenticate();
            $controller->getMe($user);
        }
    }

    // 2. PROFILE ROUTES
    elseif ($segments[0] === 'profiles') {
        $controller = new ProfileController();
        if ($segments[1] === 'me' && $method === 'PUT') {
            $user = AuthMiddleware::authenticate();
            $controller->updateProfile($user);
        } elseif ($segments[1] === 'education' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->addEducation($user);
        } elseif ($segments[1] === 'experience' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->addExperience($user);
        } elseif (is_numeric($segments[1]) && $method === 'GET') {
            $controller->getProfile((int) $segments[1]);
        }
    }

    // 3. PROFESSIONALS & LAWYERS
    elseif ($segments[0] === 'professionals') {
        $controller = new ProfessionalController();
        if ($segments[1] === 'discover' && $method === 'GET') {
            $controller->discover();
        } elseif ($segments[1] === 'practice-areas' && $method === 'GET') {
            $controller->getPracticeAreas();
        } elseif ($segments[1] === 'verify' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->submitVerification($user);
        }
    }

    // 4. POSTS & SOCIAL FEED
    elseif ($segments[0] === 'posts') {
        $controller = new PostController();
        if ($segments[1] === 'feed' && $method === 'GET') {
            $user = AuthMiddleware::optionalAuth();
            $controller->getFeed($user);
        } elseif ($method === 'POST' && count($segments) === 1) {
            $user = AuthMiddleware::authenticate();
            $controller->createPost($user);
        } elseif (is_numeric($segments[1]) && ($segments[2] ?? '') === 'react' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->reactPost($user, (int) $segments[1]);
        } elseif (is_numeric($segments[1]) && ($segments[2] ?? '') === 'comments') {
            if ($method === 'GET') {
                $controller->getComments((int) $segments[1]);
            } elseif ($method === 'POST') {
                $user = AuthMiddleware::authenticate();
                $controller->addComment($user, (int) $segments[1]);
            }
        }
    }

    // 5. POLLS
    elseif ($segments[0] === 'polls' && is_numeric($segments[1]) && ($segments[2] ?? '') === 'vote' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        (new PostController())->votePoll($user, (int) $segments[1]);
    }

    // 6. LEGAL HELP & Q&A
    elseif ($segments[0] === 'legal-help') {
        $controller = new LegalHelpController();
        if ($segments[1] === 'categories' && $method === 'GET') {
            $controller->getCategories();
        } elseif ($segments[1] === 'problems' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->postProblem($user);
        } elseif ($segments[1] === 'questions' && count($segments) === 2) {
            if ($method === 'GET') {
                $controller->getQuestions();
            } elseif ($method === 'POST') {
                $user = AuthMiddleware::authenticate();
                $controller->askQuestion($user);
            }
        } elseif ($segments[1] === 'questions' && is_numeric($segments[2])) {
            if (count($segments) === 3 && $method === 'GET') {
                $controller->getQuestionDetail((int) $segments[2]);
            } elseif (($segments[3] ?? '') === 'answers' && $method === 'POST') {
                $user = AuthMiddleware::authenticate();
                $controller->answerQuestion($user, (int) $segments[2]);
            }
        }
    }

    // 7. CAREERS, JOBS & REQUIREMENTS
    elseif ($segments[0] === 'jobs') {
        $controller = new JobController();
        if (count($segments) === 1) {
            if ($method === 'GET') {
                $controller->getJobs();
            } elseif ($method === 'POST') {
                $user = AuthMiddleware::authenticate();
                $controller->createJob($user);
            }
        } elseif (is_numeric($segments[1]) && ($segments[2] ?? '') === 'apply' && $method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->applyJob($user, (int) $segments[1]);
        }
    } elseif ($segments[0] === 'requirements') {
        $controller = new JobController();
        if ($method === 'GET') {
            $controller->getRequirements();
        } elseif ($method === 'POST') {
            $user = AuthMiddleware::authenticate();
            $controller->createRequirement($user);
        }
    }

    // 8. CASE WORKSPACE
    elseif ($segments[0] === 'cases') {
        $controller = new CaseController();
        $user = AuthMiddleware::authenticate();
        if (count($segments) === 1 && $method === 'GET') {
            $controller->getCases($user);
        } elseif (is_numeric($segments[1])) {
            if (count($segments) === 2 && $method === 'GET') {
                $controller->getCaseDetail($user, (int) $segments[1]);
            } elseif (($segments[2] ?? '') === 'hearings' && $method === 'POST') {
                $controller->addHearing($user, (int) $segments[1]);
            } elseif (($segments[2] ?? '') === 'tasks' && $method === 'POST') {
                $controller->addTask($user, (int) $segments[1]);
            }
        }
    }

    // 9. DOCUMENT VAULT
    elseif ($segments[0] === 'documents') {
        $controller = new DocumentController();
        $user = AuthMiddleware::authenticate();
        if ($method === 'GET') {
            $controller->getDocuments($user);
        } elseif ($method === 'POST') {
            $controller->addDocument($user);
        }
    }

    // 10. MESSAGING
    elseif ($segments[0] === 'messages') {
        $controller = new MessageController();
        $user = AuthMiddleware::authenticate();
        if (($segments[1] ?? '') === 'conversations') {
            if (count($segments) === 2 && $method === 'GET') {
                $controller->getConversations($user);
            } elseif (is_numeric($segments[2]) && $method === 'GET') {
                $controller->getMessages($user, (int) $segments[2]);
            }
        } elseif (count($segments) === 1 && $method === 'POST') {
            $controller->sendMessage($user);
        }
    }

    // 11. GLOBAL SEARCH
    elseif ($segments[0] === 'search' && $method === 'GET') {
        (new SearchController())->globalSearch();
    }

    // 12. ADMIN PORTAL
    elseif ($segments[0] === 'admin') {
        $controller = new AdminController();
        if ($segments[1] === 'metrics' && $method === 'GET') {
            $controller->getDashboardMetrics();
        } elseif ($segments[1] === 'verifications' && count($segments) === 2 && $method === 'GET') {
            $controller->getVerificationRequests();
        } elseif ($segments[1] === 'verifications' && is_numeric($segments[2]) && ($segments[3] ?? '') === 'review' && $method === 'POST') {
            $user = AuthMiddleware::optionalAuth() ?? ['id' => 5, 'role' => 'admin'];
            $controller->reviewVerification($user, (int) $segments[2]);
        } elseif ($segments[1] === 'users' && count($segments) === 2 && $method === 'GET') {
            $controller->getUsers();
        } elseif ($segments[1] === 'users' && is_numeric($segments[2]) && ($segments[3] ?? '') === 'toggle-status' && $method === 'POST') {
            $user = AuthMiddleware::optionalAuth() ?? ['id' => 5, 'role' => 'admin'];
            $controller->toggleUserStatus($user, (int) $segments[2]);
        }
    }

    // Endpoint Not Found
    Response::notFound("Endpoint '/$path' not found or method '$method' not allowed.");

} catch (Throwable $e) {
    Response::error('Server Error: ' . $e->getMessage(), null, 500);
}
