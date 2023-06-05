import { Avatar, styled } from "@mui/material";
import React from "react";
import { StyledFlexRow } from "styles";
import {BsInfoCircleFill, BsTelegram, BsGithub, BsNewspaper} from 'react-icons/bs'
import { ReactElement } from "react";
import {BsGlobe} from 'react-icons/bs'
import { AppTooltip } from "./Tooltip";

interface Props {
  telegram?: string;
  github?: string;
  website?: string;
  className?: string;
  whitepaper?: string
  about?: string;
}

export function Socials({
  telegram,
  github,
  website,
  className = "",
  whitepaper,
  about,
}: Props) {

  return (
    <StyledContainer className={className}>
      <Social
        tooltip="Telegram"
        url={telegram}
        icon={<BsTelegram size={20} />}
      />
      <Social tooltip="GitHub" url={github} icon={<BsGithub size={23} />} />
      <Social tooltip="Website" url={website} icon={<BsGlobe size={20} />} />
      <Social
        tooltip="White paper"
        url={whitepaper}
        icon={<BsNewspaper size={20} />}
      />
      <Social
        tooltip="About"
        url={about}
        icon={<BsInfoCircleFill size={20} />}
      />
    </StyledContainer>
  );
}


const Social = ({
  url,
  icon,
  tooltip,
}: {
  url?: string;
  icon: ReactElement;
  tooltip: string;
}) => {  
  if (!url || !url.startsWith('https')) return null;
  return (
    <AppTooltip text={tooltip}>
      <StyledSocial href={url} target="_blank">
        {icon}
      </StyledSocial>
    </AppTooltip>
  );
};

const StyledSocial = styled("a")(({ theme }) => ({
  svg: {
   
    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255, 0.7)' :  'rgba(0,0,0, 0.6)'
  },
}));

const StyledContainer = styled(StyledFlexRow)({
  gap:10
});
