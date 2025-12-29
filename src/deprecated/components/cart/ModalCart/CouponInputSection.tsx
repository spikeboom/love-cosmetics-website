import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlineChevronRight } from "react-icons/md";
import { CircularProgress, IconButton, InputBase, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export function CouponInputSection({ 
  openCupom, 
  setOpenCupom, 
  cupom, 
  setCupom, 
  handleAddCupomLocal, 
  loadingCupom 
}: any) {
  return (
    <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
      <p className="flex items-center gap-1 pr-[4px] text-[14px]">
        <RiCoupon2Line />
        cupom
      </p>
      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
        <span
          data-testid="coupon-toggle-button"
          className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#7045f5]"
          onClick={() => setOpenCupom(!openCupom)}
        >
          inserir código
          <MdOutlineChevronRight size={18} />
        </span>
        {openCupom && (
          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCupomLocal();
            }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              borderRadius: "3px",
              width: "180px",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              value={cupom}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setCupom(event.target.value.toUpperCase());
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddCupomLocal();
                }
              }}
              inputProps={{
                "data-testid": "coupon-input",
              }}
            />
            <IconButton
              data-testid="apply-coupon-button"
              type="button"
              aria-label="enviar cupom"
              onClick={handleAddCupomLocal}
            >
              {loadingCupom ? (
                <CircularProgress size={24} />
              ) : (
                <SendIcon color="primary" />
              )}
            </IconButton>
          </Paper>
        )}
      </div>
    </div>
  );
}