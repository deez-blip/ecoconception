import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 20,
      maxVUs: 60
    }
  }
};

const baseUrl = __ENV.BASE_URL;

if (!baseUrl) {
  throw new Error('BASE_URL env var is required');
}

export default function () {
  const response = http.get(`${baseUrl}/api/public-heavy?mode=before&size=30000&rounds=80`);
  check(response, {
    'status is 200': (r) => r.status === 200
  });
}
