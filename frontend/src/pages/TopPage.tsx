import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export const TopPage = () => (
  <div>
    <h1 className="text-3xl font-bold text-blue-600">面カツ道場</h1>
    <Button variant="contained" component={Link} to="/dev/health">
      疎通確認
    </Button>
  </div>
);