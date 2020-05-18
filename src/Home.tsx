import React from "react";

// Local Imports
// ====================================================
import Footer from "./Components/Footer";
import Header from "./Components/Header";

// Material-UI Imports
// ====================================================
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Link from "@material-ui/core/Link";
import SearchIcon from "@material-ui/icons/Search";
import Typography from "@material-ui/core/Typography";

// Other Imports
// ====================================================
import { Form } from "react-final-form";
import { formatDistanceToNow, format } from "date-fns";
import { GH_REGEX, ReposListReleasesResponseData, getReleases, validGitHubRepoURL } from "./lib/releases";
import { TextField } from "mui-rff";

interface FormValues {
  url: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3, 2),
    marginTop: "auto",
  },
}));

export const Home = () => {
  const classes = useStyles();

  const [releases, setReleases] = React.useState<ReposListReleasesResponseData[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [rateRemaining, setRateRemaining] = React.useState<number | null>(null);
  const [rateReset, setRateReset] = React.useState<number | null>(null);
  const [rateLimit, setRateLimit] = React.useState<number | null>(null);

  const onProgress = (completed: number, total: number, remaining: number, limit: number, resetDate: number) => {
    const progress = (completed * 100) / total;
    setProgress(progress);
    setRateRemaining(remaining);
    setRateLimit(limit);
    setRateReset(resetDate);
  };

  const onSearch = async ({ url }: FormValues) => {
    const urlParts = GH_REGEX.exec(url);

    if (urlParts === null) {
      console.log("Unable to extract any results from", url);
      return;
    }

    if (urlParts.length < 3) {
      console.log("Unable to extract the right number of results from", url);
      return;
    }

    const owner = urlParts[1];
    const repo = urlParts[2];

    setLoading(true);

    console.log("Fetching releases for", owner, repo);

    try {
      const releases = await getReleases(owner, repo, onProgress);
      setReleases(releases);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSearch = (event: React.MouseEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    input.select();
  };

  console.log(rateLimit);

  return (
    <div className={classes.root}>
      <Header />

      {/* Page Body */}
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            {/* <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Enter the GitHub repo:
            </Typography> */}
            <Form
              onSubmit={onSearch}
              initialValues={{
                url: "https://github.com/mui-org/material-ui",
              }}
            >
              {({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                  <TextField
                    name="url"
                    fullWidth
                    variant="outlined"
                    placeholder="https://github.com/mui-org/material-ui"
                    fieldProps={{
                      validate: validGitHubRepoURL,
                    }}
                    onClick={selectSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: valid && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSubmit}>Go</IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
              )}
            </Form>
            <Grid container direction="row" justify="space-between">
              <Grid item>
                {rateRemaining !== null && <Typography variant="caption">Rate Remaining: {rateRemaining}</Typography>}
              </Grid>
              <Grid item>
                {rateReset !== null && (
                  <Typography variant="caption">
                    Rate Reset: {format(new Date(rateReset * 1000), "HH:mm:ss")}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Container>
        </div>

        {loading && (
          <LinearProgress
            variant={progress === null ? "indeterminate" : "determinate"}
            value={progress === null ? undefined : progress}
          />
        )}

        {/* Results */}
        <Container className={classes.cardGrid} maxWidth="md">
          <Grid container spacing={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Release Name</TableCell>
                    <TableCell>Date Published</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {releases?.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell>
                        <Link href={release.html_url} target="_blank" rel="noopener">
                          {release.name || release.tag_name}
                        </Link>
                      </TableCell>
                      <TableCell>{`${formatDistanceToNow(new Date(release.published_at))} ago`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
